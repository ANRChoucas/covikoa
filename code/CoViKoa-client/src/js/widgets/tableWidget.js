import { StackedPanel } from '@lumino/widgets';
import {
  BasicKeyHandler, BasicMouseHandler,
  BasicSelectionModel,
  DataGrid,
  JSONModel,
} from '@lumino/datagrid';
import CustomMouseHandler from '../customMouseHandler';

/**
 * Widget containing a table, corresponding to gviz:TableComponent.
 *
 *
 */
export default class TableWidget extends StackedPanel {
  constructor(options) {
    super();
    this.addClass('cvk-TableWidget');
    const { titleTable, iriTable, schemaAndData } = options;
    // Iri (in the graph) of this widget
    this.node.setAttribute('iri', iriTable);
    // Title of the tab in SplitPanel
    this.title.label = titleTable;
    // Instantiate DataGrid based on our data
    const model = new JSONModel(schemaAndData);
    const grid = new DataGrid({
      style: {
        ...DataGrid.defaultStyle,
        rowBackgroundColor: (i) => (i % 2 === 0 ? 'rgba(64, 115, 53, 0.2)' : ''),
      },
      defaultSizes: { // TODO: Maybe compute width values based on the data ...
        rowHeight: 32,
        columnWidth: 96,
        rowHeaderWidth: 128,
        columnHeaderHeight: 32,
      },
    });
    grid.dataModel = model;
    // Key handler, such as 'esc' to deselect a line, etc.
    // (we use the default key handler)
    grid.keyHandler = new BasicKeyHandler();
    // Mouse handler, we use a custom one
    // in order to allow possible identify interactions
    grid.mouseHandler = new BasicMouseHandler(); // new CustomMouseHandler(grid);
    // The selection model, what is selected on click and so on
    grid.selectionModel = new BasicSelectionModel({
      dataModel: model,
      selectionMode: 'row',
    });
    this.addWidget(grid);
  }
}
