### Description

- `CoViKoa` : Contains the Java code to instrument the vocabularies and the reasoning, based on SHACL, of CoViKoa. Also contains the Python code wrapping this Java code and exposing it in HTTP with an interface that partially implements the SPARQL protocol.

- `ServiceGeosparqlObjetTerritoire` : Contains the code of a geospatial triplestore (Fuseki with GeoSPARQL) used to serve the reference objects for the case studies.

- `CoViKoa-client` : Contains the Javascript code making SPARQL queries on the knowledge contained in CoViKoa and transforming it into a geovisualisation using OpenLayers.



### Requirements

- Python3 + pip, Node.js + npm, JAVA Runtime Environnement 8+ (or a JDK + Maven if recompiling the JAR file is necessary)


### Installation

**Installing dependencies:**

- For Python :

```
pushd CoViKoa/py-interactive && pip3 install -r requirements.txt && popd
```

- For Javascript :

```
pushd CoViKoa-client/ && npm install && popd
```


### Utilisation

**Compiling javascript code:** *(in `CoViKoa-client` folder)*

```
npm run build
```


**Compiling javascript code and watching for changer:** *(in `CoViKoa-client` folder)*

```
npm run watch
```

**Starting the python server:** *(it will start the triplestore with OSM objects and the triplestore containing our KB and expose it though a SPARQL service)*

```
uvicorn server:app
```

_**Go to the demo page (http://localhost:8000/index.html) 🌟🌟🌟**_
