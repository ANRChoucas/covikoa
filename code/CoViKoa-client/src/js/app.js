import '../css/styles.css';
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import { DockPanel, Widget, BoxPanel } from '@lumino/widgets';
import { Message, MessageLoop } from '@lumino/messaging';
import { QUERY_URL } from './consts';
import { bindMapInteractions, bindTerrainInteractions } from './interactions';
import {
  reqQuery,
  queryContextGVA,
  makeQueryLegend,
  makeQueryPortrayal,
} from './queries';
import makeLegend from './legend';
import { makeMapLayersAndPortrayals, handleMapSynchronisation } from './utils/map';
import ContentWidget from './widgets/contentWidget';
import MapWidgetOpenLayers from './widgets/mapWidgetOpenLayers';
import TableWidget from './widgets/tableWidget';
import TerrainWidgetOpenglobus from './widgets/terrainWidgetOpenglobus';
import {
  sparqlRequestToTableData,
  responseToApplicationDescription,
  sparqlQueryToContentWidgetData,
} from './helpers';
import { getLastWidget } from './utils/widget';
import { makeTerrainLayersAndPortrayals } from './utils/terrain';

global.State = {
  maps: [], // An array of all the map components
  terrains: [], // An array of all the terrain components
  tables: [], // An array of all the table components
  others: [], // An array of other components, in their own container (i.e not legend / popup)
  interactions: {}, // A mapping id > interaction object for all the interactions encountered
};

const onload = async () => {
  // We use Lumino.js containers / widgets in order to obtain resizable boxes
  // for element we put in it as well as messaging and some other stuffs.
  //
  // This is the main container for any stuff in the application
  // It doesn't allow resizing in itself
  const main = new BoxPanel({ direction: 'left-to-right', spacing: 0 });
  main.id = 'main';

  // TODO:
  // 1. make the request to know what are the component of the application                         X
  // 2. decide if we need a SplitPanel or DockPanel (multiple maps or map(s) + table(s))
  //     or just a BoxPanel
  //     (and use ResizableSplitContainer or FixedContainer which
  //      should offer same interface for parent / child components)
  // 3. make the necessary request for each component and dispose the
  //    corresponding widgets on component from step 2                                             X
  // 4. bind interactions                                                                          X
  // 5. broadcast message saying that everything is disposed                                       X
  // 6. this message may finalize stuff in our components/widgets
  //    (such as zooming on the requested initial extent on maps)                                  X

  window.onresize = () => { main.update(); };
  Widget.attach(main, document.body);

  // Get information about the "GeoVisualApplication" and its component in the KB
  // in order to create them
  const gva_context_results = (await reqQuery(QUERY_URL, queryContextGVA)).results.bindings;
  if (!gva_context_results.length) {
    throw new Error('No results found. Is the requested graph the right one? Is there a gviz:GeoVisualApplication as well as GeoVisualComponents declared ?');
  }
  // Transform the result of the sparql query to an easier to use
  // description, ready to be used to create the various components
  const description = responseToApplicationDescription(gva_context_results);

  // Maybe there is a title to be used for this gviz:GeoVisualApplication..
  if (description.app.title) {
    document.title = description.app.title;
  }

  // This is the container in which we put the various components.
  // We use a BoxPanel if there is only one component otherwise
  // a DockPanel that allow to have resizable widgets in tabs (with title)
  const map_terrain_container = (description.components.length > 1)
    ? new DockPanel()
    : new BoxPanel();
  map_terrain_container.id = 'map-terrain-container';
  main.addWidget(map_terrain_container);
  console.log(map_terrain_container);
  // Loop over the components to create them in the appropriate order..
  await Promise.all(description.components
    .map(async (componentParams) => {
      if (componentParams.type === 'http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#Map2dComponent') {
        const mapWidget = new MapWidgetOpenLayers(componentParams);
        if (description.components.length === 1 && description.components[0].width) {
          mapWidget.setMaxSize();
        }
        const lastWidget = getLastWidget(map_terrain_container);
        map_terrain_container.addWidget(mapWidget, { mode: 'split-right', ref: lastWidget });

        const map = mapWidget.olMap;
        const iriMap = componentParams.iri;

        // Get information about the GeoVisualIntermediateRepresentation in the KB
        // regarding this Map2dComponent
        const gvr_results = (
          await reqQuery(QUERY_URL, makeQueryPortrayal(iriMap))).results.bindings;

        const portrayals = makeMapLayersAndPortrayals(gvr_results, mapWidget);
        // For debugging purpose:
        //   - the result from the sparql endpoint
        //   - an array of "portrayal", each will be converted to a layer
        //   - the ol.Map object on which these layers will be added
        console.log(gvr_results, portrayals, map);

        // Do we need to build a legend ?
        const result_legend = (
          await reqQuery(QUERY_URL, makeQueryLegend(iriMap))).results.bindings;

        if (result_legend.length) {
          // There is a legend linked to this map
          makeLegend(map, gvr_results, portrayals);
        }

        // the fact that it allows interaction(s) is verified later
        bindMapInteractions(mapWidget);

        global.State.maps.push(mapWidget);
      } else if (componentParams.type === 'http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#TableComponent') {
        const dataTable = await sparqlRequestToTableData(componentParams.iri);
        const tableWidget = new TableWidget(dataTable);
        map_terrain_container.addWidget(
          tableWidget,
          { mode: 'split-bottom' },
        );
        global.State.tables.push(tableWidget);
      } else if (componentParams.type === 'http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#StaticContentComponent') {
        const data = await sparqlQueryToContentWidgetData(componentParams.iri);
        const contentWidget = new ContentWidget(data);
        const lastWidget = getLastWidget(map_terrain_container);
        map_terrain_container.addWidget(
          contentWidget,
          { mode: 'split-right', ref: lastWidget },
        );
        global.State.others.push(contentWidget);
      } else if (componentParams.type === 'http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#Map3dComponent') {
        const terrainWidget = new TerrainWidgetOpenglobus(componentParams);
        const iriComponent = componentParams.iri;
        // Get information about the GeoVisualIntermediateRepresentation in the KB
        // regarding this Map3dComponent
        const gvr_results = (
          await reqQuery(QUERY_URL, makeQueryPortrayal(iriComponent))).results.bindings;

        const lastWidget = getLastWidget(map_terrain_container);
        map_terrain_container.addWidget(
          terrainWidget, { mode: 'split-bottom', ref: lastWidget },
        );

        const portrayals = makeTerrainLayersAndPortrayals(gvr_results, terrainWidget);
        console.log(portrayals);
        global.State.terrains.push(terrainWidget);
        bindTerrainInteractions(terrainWidget);
      }
    }));

  // Handle synchronisation between maps...
  handleMapSynchronisation(global.State.maps, description.components);

  // Send a message saying that all widgets are attached...
  // TODO: use a signal instead...
  const message = new Message('all-widgets-attached');
  [].concat(
    global.State.maps,
    global.State.terrains,
  ).forEach((component) => {
    MessageLoop.sendMessage(component, message);
  });
  // Just so that we remember and maybe use it later...
  global.State.description = description;
};

window.onload = onload;
