// First query is to get informations about the GeoVisualApplication,
// its GeoVisualComponent(s) and their possible initial context
export const queryContextGVA = `
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix geo: <http://www.opengis.net/ont/geosparql#>
prefix cvkd: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>
prefix cvkc: <http://lig-tdcge.imag.fr/steamer/covikoa/context#>
prefix owl: <http://www.w3.org/2002/07/owl#>
prefix dct: <http://purl.org/dc/terms/>
prefix scale: <https://gis.lu.se/ont/visualisation_scale#>

SELECT DISTINCT ?app ?appTitle ?geovizcomponent ?typeComponent ?componentTitle ?w ?h ?geomInitialExtent ?basemapTemplateUrl ?basemapAttribution ?otherGvc ?order ?position ?deactivatedInteractions ?scaleConstraintMinZoom ?scaleConstraintMaxZoom ?scaleConstraintMinReso ?scaleConstraintMaxReso
WHERE {
  ?app a gviz:GeoVisualApplication .
  ?app gviz:hasGeoVisualComponent ?geovizcomponent .

  # Maybe the app has a title ?
  OPTIONAL {
    ?app dct:title ?appTitle .
  }

  ?geovizcomponent a ?typeComponent .
  FILTER(?typeComponent in (gviz:Map2dComponent, gviz:Map3dComponent, gviz:TableComponent, gviz:StaticContentComponent, gviz:FilterComponent)) .

  # Maybe the component has a title ?
  OPTIONAL {
    ?geovizcomponent dct:title ?componentTitle .
  }

  # Maybe the map is linked (sync'd) to an other map ?
  OPTIONAL {
    ?geovizcomponent gviz:hasCenterAndResolutionSynchronizedWith ?otherGvc .
  }

  # ...
  OPTIONAL { ?geovizcomponent cvkc:position ?position }
  OPTIONAL { ?geovizcomponent cvkc:order ?order }
  OPTIONAL {
    ?geovizcomponent cvkc:widthPx ?w ;
                     cvkc:heightPx ?h .
  }
  OPTIONAL {
    ?geovizcomponent cvkc:widthRelative ?wRelative ;
                     cvkc:heightRelative ?hRelative .
  }
  OPTIONAL {
    ?geovizcomponent cvkc:hasConstrainedScaleRange ?scaleConstraint .
    OPTIONAL {
        ?scaleConstraint scale:hasMinZoomLevel ?scaleConstraintMinZoom .
        ?scaleConstraint scale:hasMaxZoomLevel ?scaleConstraintMaxZoom .
    }
    OPTIONAL {
        ?scaleConstraint scale:hasMinScaleDenominator ?scaleConstraintMinReso .
        ?scaleConstraint scale:hasMaxScaleDenominator ?scaleConstraintMaxReso .
    }
  }
  OPTIONAL {
    ?geovizcomponent cvkc:hasBaseMap [
      cvkc:templateUrl ?basemapTemplateUrl ;
      dct:rights ?basemapAttribution ;
    ] .
  }
  # Maybe an initial extent for the map ?
  OPTIONAL {
    ?geovizcomponent cvkc:hasMapExtent [ geo:asWKT ?geomInitialExtent ] .
  }
  
  # Maybe the component deactivates some classical interactions like
  # zooming, panning or rotating
  OPTIONAL {
    {
      SELECT ?geovizcomponent (GROUP_CONCAT(?someStuff; separator=",") as ?deactivatedInteractions) WHERE {
          ?geovizcomponent cvkc:deactivesInteraction ?someStuff .
      } GROUP BY ?geovizcomponent
    }
  }
  # Maybe
}
`;

export const makeQueryLegend = (mapComponentUri) => `
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>

SELECT *
WHERE {
  ?legendcomponent a gviz:LegendComponent ;
                   gviz:linkedTo <${mapComponentUri}> .
}`;

// Returns a parametrized query for a given GeoVisualComponent
// allowing to fetch all the necessary informations to
// build the portrayals this component should display
// language=SPARQL
export const makeQueryPortrayal = (mapComponentUri) => /* language=SPARQL */ `
prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix dct: <http://purl.org/dc/terms/>
prefix prov: <http://www.w3.org/ns/prov#>
prefix geo: <http://www.opengis.net/ont/geosparql#>
prefix cvkd: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>
prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>
prefix graphic: <https://gis.lu.se/ont/data_portrayal/graphic#>
prefix symbolizer: <https://gis.lu.se/ont/data_portrayal/symbolizer#>
prefix scale: <https://gis.lu.se/ont/visualisation_scale#>
prefix ion: <http://lig-tdcge.imag.fr/steamer/covikoa/interaction#>
prefix afn: <http://jena.apache.org/ARQ/function#>

SELECT DISTINCT ?labelPortrayal ?portrayal ?portrayalRule ?gvrs ?indivs ?geoms ?materialisations ?displayIndex ?symbolizer ?typeSymbolizer ?propJson ?minScale ?maxScale ?minZoomLevel ?maxZoomLevel ?labelSymbol ?interaction
WHERE {
  {
  SELECT
    ?portrayal
    ?labelPortrayal
    ?portrayalRule
    ?displayIndex
    ?interaction
    (GROUP_CONCAT(?gvr;separator=";") as ?gvrs)
    (GROUP_CONCAT(?indiv;separator=";") as ?indivs)
    (GROUP_CONCAT(?geom;separator=";") as ?geoms)
    (GROUP_CONCAT(?materialisation;separator=";") as ?materialisations)
    ?symbolizer
    ?minScale
    ?maxScale
    ?minZoomLevel
    ?maxZoomLevel
    ?labelSymbol
  WHERE {
        ?gvr gviz:represents ?indiv ;
              gviz:hasMaterialisation ?materialisation .
        ?materialisation gviz:appearsIn <${mapComponentUri}> ;
                          cvkd:fromPortrayalRule ?portrayalRule ;
                          gviz:isSymbolizedBy ?symbolizer ;
                          geo:hasGeometry [ geo:asWKT ?geom ] .

        ?portrayal gviz:hasPortrayalRule ?portrayalRule .

        OPTIONAL {
          ?materialisation gviz:displayIndex ?displayIndex .
        }
        OPTIONAL {
          ?materialisation scale:hasScale [
              scale:hasMinZoomLevel ?minZoomLevel ;
              scale:hasMaxZoomLevel ?maxZoomLevel ;
          ] .
        }
        OPTIONAL {
          ?materialisation scale:hasScale [
              scale:hasMinScaleDenominator ?minScale ;
              scale:hasMaxScaleDenominator ?maxScale ;
          ] .
        }
        # We want the label associated to the portrayal rule and to its parent portrayal
        OPTIONAL {
          ?portrayal dct:title ?labelPortrayal .
        }
        OPTIONAL {
          ?symbolizer ^(symbolizer:hasSymbolizer) ?symbol .
          ?symbol dct:title ?labelSymbol .
          # Maybe the symbolizer is used in many symbols, hence the "filter exists" (so that we have the proped label)
          # but also maybe the symbol is not directly linked to the portrayal rule (but in this case
          # we are sure the symbolizer is derived from a TemplateSymbolizer, so it is only used once, so no problem when fetching its label)
          FILTER(
            EXISTS { ?portrayalRule gviz:hasSymbol ?symbol . }
            || NOT EXISTS { [] gviz:hasSymbol ?symbol . }
          )
        }
    } GROUP BY ?portrayal ?labelPortrayal ?portrayalRule ?symbolizer ?labelSymbol ?interaction ?displayIndex ?minScale ?maxScale ?minZoomLevel ?maxZoomLevel
  }
  # Serialise the symbolizer in JSON
  ?symbolizer gviz:asGeoStylerJSON ?propJson .
  # We want to know if the symbolizer is a (Point|Line|Polygon|Text|Composite)Symbolizer
  ?symbolizer a ?typeSymbolizer .
  ?typeSymbolizer rdfs:subClassOf symbolizer:Symbolizer .
  FILTER(?typeSymbolizer != symbolizer:Symbolizer) .
  
  # We want to know if interaction are allowed on these features...
  # (and we serialize all this information in JSON, in a subquery with group concat
  # because there may by several interactions on a portrayal)
  OPTIONAL {
    ?portrayal ion:allowsInteraction ?ion .
    {
    SELECT ?portrayal (CONCAT('[', GROUP_CONCAT(?_interaction;separator=","), ']') as ?interaction) WHERE {
          ?portrayal ion:allowsInteraction ?ion .
          ?ion ion:interactionAsJSON ?_interaction .
      } GROUP BY ?portrayal
    }
  }
} ORDER BY ?displayIndex ?symbolizer
`;

// Returns a parametrized query for a given GeoVisualIntermediateRepresentation
// allowing to fetch all the data from the individual it represents
export const makeQueryDataIndividual = (gvrIri) => `
prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?indiv ?p ?v
WHERE {
  <${gvrIri}> gviz:represents ?indiv .
  ?indiv ?p ?v .
}
`;

export const makeQueryTable = (tableIri) => `
prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix dct: <http://purl.org/dc/terms/>
prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>
prefix cvkd: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>

SELECT ?tableComponent ?tableTitle ?conceptTargetDataModel ?indiv ?p ?v WHERE {
  BIND(<${tableIri}> as ?tableComponent) .
  ?tableComponent a gviz:TableComponent .
  OPTIONAL { ?tableComponent dct:title ?tableTitle . }
  ?portrayal a gviz:Portrayal ;
    gviz:onComponent ?tableComponent ;
    gviz:denotesConcept ?conceptTargetDataModel .
  ?indiv a ?conceptTargetDataModel .
  ?indiv ?p ?v .
  FILTER(isLiteral(?v)).
}
`;

export const makeQueryStaticContentComponent = (staticComponentIri) => `
prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix dct: <http://purl.org/dc/terms/>
prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>
prefix cvkc: <http://lig-tdcge.imag.fr/steamer/covikoa/context#>
prefix cvkd: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>

SELECT ?staticContentComponent ?staticContentComponentTitle ?htmlContent ?width ?height ?position WHERE {
  BIND(<${staticComponentIri}> as ?staticComponentIri) .
  ?staticContentComponent a gviz:StaticContentComponent .
  OPTIONAL { ?staticContentComponent dct:title ?staticContentComponentTitle . }
  ?staticContentComponent cvkd:hasHtmlContent ?htmlContent .
  OPTIONAL { ?staticContentComponent cvkc:width ?width . }
  OPTIONAL { ?staticContentComponent cvkc:height ?height . }
  OPTIONAL { ?staticContentComponent cvkc:position ?position . }
}
`;

// Allows to retrieve the IRI of the materialisation(s) on which
// an interaction has its outcome
// when the selection strategy is FollowPropertyPath
export const makeQueryInteractionFollowPropertyPathForTarget = (
  iriMaterialisation,
  propertyPathToFollow,
  targetedPortrayalOrPortrayalRule,
) => `
prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix cvkd: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>
prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>
prefix ion: <http://lig-tdcge.imag.fr/steamer/covikoa/interaction#>

SELECT (GROUP_CONCAT(?mat2;separator=";") as ?materialisations)
WHERE {
 ?ir gviz:hasMaterialisation <${iriMaterialisation}> .
 ?ir gviz:represents ?indiv .
 ?indiv ${propertyPathToFollow} ?otherEntity .
 ?otherEntity ^(gviz:represents) ?ir2 .
 ?ir2 gviz:hasMaterialisation ?mat2 .
 {
    ?mat2 cvkd:fromPortrayalRule <${targetedPortrayalOrPortrayalRule}> .
  } UNION {
    ?mat2 cvkd:fromPortrayalRule/(^gviz:hasPortrayalRule) <${targetedPortrayalOrPortrayalRule}> .
  }
} GROUP BY ?indiv
`;

export const makeQueryInteractionFollowPropertyPathForRest = (
  iriMaterialisation,
  propertyPathToFollow,
  targetedPortrayalOrPortrayalRule,
) => `
prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix cvkd: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>
prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>
prefix ion: <http://lig-tdcge.imag.fr/steamer/covikoa/interaction#>

SELECT (GROUP_CONCAT(?mat2;separator=";") as ?materialisations)
WHERE {
 ?ir gviz:hasMaterialisation <${iriMaterialisation}> .
 ?ir gviz:represents ?indiv .
 ?indiv ${propertyPathToFollow} ?otherEntity .
 ?otherEntity ^(gviz:represents) ?ir2 .
 ?ir2 gviz:hasMaterialisation ?mat2 .
 {
    ?mat2 cvkd:fromPortrayalRule <${targetedPortrayalOrPortrayalRule}> .
  } UNION {
    ?mat2 cvkd:fromPortrayalRule/(^gviz:hasPortrayalRule) <${targetedPortrayalOrPortrayalRule}> .
  }
  {
    ?otherMaterialisation cvkd:fromPortrayalRule <${targetedPortrayalOrPortrayalRule}> .
  } UNION {
    <${targetedPortrayalOrPortrayalRule}> gviz:hasPortrayalRule ?otherPortrayalRule .
    ?otherMaterialisation cvkd:fromPortrayalRule ?otherPortrayalRule .
  }
  FILTER(?otherMaterialisation != ?mat2)
} GROUP BY ?indiv
`;

// Allows to retrieve the IRI of the materialisation(s) on which
// an interaction has its outcome
// when the selection strategy is SameIndividual
export const makeQueryInteractionSameIndividualForTarget = (
  iriMaterialisation,
  targetedPortrayalOrPortrayalRule,
) => `
prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix cvkd: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>
prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>
prefix ion: <http://lig-tdcge.imag.fr/steamer/covikoa/interaction#>

SELECT ?materialisations WHERE {
  ?ir gviz:hasMaterialisation <${iriMaterialisation}> .
  ?ir gviz:represents ?indiv .
  ?indiv ^(gviz:represents)/gviz:hasMaterialisation ?materialisations .
  {
    ?materialisations cvkd:fromPortrayalRule <${targetedPortrayalOrPortrayalRule}> .
  } UNION {
    ?materialisations cvkd:fromPortrayalRule/(^gviz:hasPortrayalRule) <${targetedPortrayalOrPortrayalRule}> .
  }
}
`;

export const makeQueryInteractionSameIndividualForRest = (
  iriMaterialisation,
  targetedPortrayalOrPortrayalRule,
) => `
prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix cvkd: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>
prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>
prefix ion: <http://lig-tdcge.imag.fr/steamer/covikoa/interaction#>

SELECT (GROUP_CONCAT(?otherMaterialisation;separator=";") as ?materialisations) WHERE {
  ?ir gviz:hasMaterialisation <${iriMaterialisation}> .
  ?ir gviz:represents ?indiv .
  ?indiv ^(gviz:represents)/gviz:hasMaterialisation ?materialisation .
  {
    ?materialisation cvkd:fromPortrayalRule <${targetedPortrayalOrPortrayalRule}> .
  } UNION {
    ?materialisation cvkd:fromPortrayalRule/(^gviz:hasPortrayalRule) <${targetedPortrayalOrPortrayalRule}> .
  }
  {
    ?otherMaterialisation cvkd:fromPortrayalRule <${targetedPortrayalOrPortrayalRule}> .
  } UNION {
    <${targetedPortrayalOrPortrayalRule}> gviz:hasPortrayalRule ?otherPortrayalRule .
    ?otherMaterialisation cvkd:fromPortrayalRule ?otherPortrayalRule .
  }
  FILTER(?otherMaterialisation != ?materialisation)
}
`;


// Query the SPARQL endpoint and get the deserialized result
export const reqQuery = (url, content) => fetch(url, {
  method: 'POST',
  body: `query=${encodeURIComponent(content)}`,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  mode: 'no-cors',
}).then((res) => res.json());

export const reqUpdate = (url, content) => fetch(url, {
  method: 'POST',
  body: `update=${encodeURIComponent(content)}`,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  mode: 'no-cors',
}).then((res) => res.text());
