// First query is to get informations about the GeoVisualComponent(s)
// and their possible initial context
export const queryContextGVA = `
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix geo: <http://www.opengis.net/ont/geosparql#>
prefix geof: <http://www.opengis.net/def/function/geosparql/>
prefix cvkr: <http://lig-tdcge.imag.fr/steamer/covikoa/derivation#>
prefix cvc: <http://lig-tdcge.imag.fr/steamer/covikoa/context#>
prefix owl: <http://www.w3.org/2002/07/owl#>

SELECT DISTINCT ?geovizcomponent ?app ?w ?h ?geomInitialExtent ?basemapTemplateUrl ?basemapAttribution ?otherGvc
WHERE {
#  ?protoapp a owl:Class ;
#     rdfs:subClassOf gviz:GeoVisualApplication .
#  FILTER(?protoapp != gviz:GeoVisualApplication).
  ?app gviz:hasGeoVisualComponent ?geovizcomponent .
  ?geovizcomponent a gviz:Map2dComponent .

  OPTIONAL {
    ?geovizcomponent gviz:linkedTo ?otherGvc .
    ?otherGvc a gviz:Map2dComponent .
  }

  OPTIONAL {
    ?app cvc:hasVisualisationContext ?context .
    ?context a cvc:VisualisationContext ;
               cvc:hasMap [ owl:sameAs ?geovizcomponent ;
                 cvc:widthPx ?w ;
                 cvc:heightPx ?h ;
                ] .
    #OPTIONAL {
    #  ?context cvc:hasUserContext [
    #    cvc:hasColorVisionDeficiency ?coldef ;
    #  ] .
    #}
    OPTIONAL {
      ?context a cvc:VisualisationContext ;
                 cvc:hasMap [ owl:sameAs ?geovizcomponent ;
                    cvc:mapExtent [ geo:asWKT ?geomInitialExtent ] ;
                 ] .
    }
    OPTIONAL {
      ?context cvc:hasMap [ owl:sameAs ?geovizcomponent ;
                    cvc:hasBaseMap [
                      cvc:templateUrl ?basemapTemplateUrl ;
                      cvc:attribution ?basemapAttribution ;
                    ] ;
                 ] .
    }
  }
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
export const makeQueryPortrayal = (mapComponentUri) => `
prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix ex:  <http://example.com/ns#>
prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix geo: <http://www.opengis.net/ont/geosparql#>
prefix geof: <http://www.opengis.net/def/function/geosparql/>
prefix graphic: <https://gis.lu.se/ont/data_portrayal/graphic#>
prefix symbolizer: <https://gis.lu.se/ont/data_portrayal/symbolizer#>
prefix scale: <https://gis.lu.se/ont/visualisation_scale#>

SELECT ?gvr ?geom ?displayIndex ?p ?symbolizer ?typeSymbolizer ?prop1 ?whatProp ?prop2 ?value ?minScale ?maxScale ?labelSymbolizer ?labelSymbolization ?identify
WHERE {
  #<${mapComponentUri}> gviz:presentsGVR ?gvr .
  ?gvr gviz:hasPortrayal ?p .
  ?p gviz:appearsIn <${mapComponentUri}> .
  ?p gviz:hasPortrayalSymbolizer ?symbolizer .

  # We want to know if the symbolizer is a (Point|Line|Polygon)Symbolizer
  ?symbolizer a ?typeSymbolizer .
  ?typeSymbolizer rdfs:subClassOf symbolizer:Symbolizer .
  FILTER(?typeSymbolizer != symbolizer:Symbolizer) .

  # Fetch display index and scale values if any
  OPTIONAL {
    ?p gviz:displayIndex ?displayIndex .
  }
  OPTIONAL {
    ?p scale:hasScale [
        scale:hasMinScaleDenominator ?minScale ;
        scale:hasMaxScaleDenominator ?maxScale ;
    ] .
  }

  # Transformed geometry or original geometry ?
  OPTIONAL {
    ?p geo:hasGeometry [geo:asWKT ?geomNew] .
  }
  OPTIONAL {
    ?gvr gviz:represents [ geo:hasGeometry [geo:asWKT ?geomOrigin] ] .
  }
  BIND(IF(BOUND(?geomNew), ?geomNew, ?geomOrigin) AS ?geom)

  # We want all the graphic properties of the symbolizer
  OPTIONAL {
     ?symbolizer ?prop1 [ a ?whatProp ; ?prop2 ?value ] .
      FILTER(
         STRSTARTS(STR(?prop1), STR(graphic:))
         && STRSTARTS(STR(?prop2), STR(graphic:))
         && STRSTARTS(STR(?whatProp), STR(graphic:))
      )
      FILTER(!STRSTARTS(STR(?whatProp), "https://gis.lu.se/ont/data_portrayal/graphic#Graphic"))
  }

  OPTIONAL {
    ?symbolizer rdfs:label ?labelSymbolizer .
  }
  ?symb <https://gis.lu.se/ont/data_portrayal/symbolizer#hasSymbolizer> ?symbolizer .
  OPTIONAL {
    ?symb rdfs:label ?labelSymbolization .
  }
  OPTIONAL {
    ?symb gviz:allowsInteraction gviz:identify .
    BIND(true as ?identify).
  }
} ORDER BY ?displayIndex ?symbolizer
`;

// Returns a parametrized query for a given GeoVisualIntermediateRepresentation
// allowing to fetch all the data from the individual it represents
export const makeQueryDataIndividual = (gvrIri) => `
prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix ex:  <http://example.com/ns#>
prefix gviz: <http://lig-tdcge.imag.fr/steamer/covikoa/geoviz#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix geo: <http://www.opengis.net/ont/geosparql#>
prefix geof: <http://www.opengis.net/def/function/geosparql/>
prefix graphic: <https://gis.lu.se/ont/data_portrayal/graphic#>
prefix symbolizer: <https://gis.lu.se/ont/data_portrayal/symbolizer#>
prefix scale: <https://gis.lu.se/ont/visualisation_scale#>

SELECT ?indiv ?p ?v
WHERE {
  <${gvrIri}> gviz:represents ?indiv .
  ?indiv ?p ?v .
  FILTER(isLiteral(?v)) .
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
