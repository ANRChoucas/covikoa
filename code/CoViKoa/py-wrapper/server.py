#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os
import sys
import toml
import uvicorn
from os.path import abspath, dirname, join as join_path
from pathlib import Path
from fastapi import FastAPI, Form, HTTPException, Query, Response
from fastapi.responses import RedirectResponse
from starlette.staticfiles import StaticFiles
from starlette.responses import JSONResponse  # FileResponse, HTMLResponse,
from starlette.middleware.cors import CORSMiddleware
from typing import Any, Dict, List, Optional, Tuple, Union
from launcherGeoSPARQL import makeGeosparqlFusekiProcess
from wrapperCoViKoaShacl import CoViKoaHandler, Utils


# Properties for exposing our web api,
# partially implementing SPARQL protocol (https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/) over our KB
# to support "query operations" and "update operations" as defined in the recommendation
# (internally, a Jena Dataset with some custom logic added to execute SHACL-AF rules recursively on
# each update and to add the new triples in the aforementioned Dataset).
app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

# [Reference](https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#query-via-get)
@app.get('/CoViKoa')
async def get_kb(query: Optional[str] = None):
    if query:
        # Process the query if a query string is given
        return dispatch_query(query)
    else:
        # Otherwise return the whole KB ("materialized")
        content = handlerInstance.writeUnionModel()
        return Response(content=content, media_type="text/turtle")


# [Reference](https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#query-via-post-urlencoded)
# [Reference](https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#update-via-post-urlencoded)
@app.post('/CoViKoa')
async def query_or_update(query: Optional[str] = Form(None), update: Optional[str] = Form(None)) -> JSONResponse:
    # if query and update : # TODO: having a request with both a query and an update is probably not allowed
    if query:
        return dispatch_query(query)
    if update:
        res = handlerInstance.updateDataModel(update)
        res = json.loads(res)
        # TODO: See https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#update-success.
        return JSONResponse(res, status_code=200 if res['response'] == 'OK' else 500)


# [Reference](https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#query-via-get)
@app.get('/CoViKoa/query')
async def handle_get_query(query: str = Query(...)):
    return dispatch_query(query)


# Update operation is not allowed using the GET method
@app.get('/CoViKoa/update')
async def handle_get_update():
    # TODO: see how other SPARQL endpoints do it (which status code specifically)
    raise HTTPException(
        status_code=404,
        detail="Update operation is not allowed using the GET HTTP method",
        headers={"X-Error": "Update operation is not allowed using the GET HTTP method"},
    )


# [Reference](https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#query-via-post-urlencoded)
@app.post('/CoViKoa/query')
async def handle_post_query(query: str = Form(...)) -> JSONResponse:
    return dispatch_query(query)


# [Reference](https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#update-via-post-urlencoded)
@app.post('/CoViKoa/update')
async def handle_post_update(update: str = Form(...)) -> JSONResponse:
    res = handlerInstance.updateDataModel(update)
    res = json.loads(res)
    # TODO: See https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#update-success.
    return JSONResponse(res, status_code=200 if res['response'] == 'OK' else 500)


@app.get("/")
async def redirect_index():
    return RedirectResponse("index.html")


@app.on_event("shutdown")
def shutdown_event():
    if geosparqlFusekiProcess:
        geosparqlFusekiProcess.terminate()
        geosparqlFusekiProcess.kill()

# Dispatch the sparql query depending on if its a "describe",
# a "construct" or a "select" query
def dispatch_query(query: str):
    _query = query.lower()

    if 'describe ' in _query:
        res = handlerInstance.queryUnionModelDescribe(query)
        return Response(content=res, media_type="text/turtle")
    elif 'construct ' in _query:
        res = handlerInstance.queryUnionModelConstruct(query)
        return Response(content=res, media_type="text/turtle")
    else:
        res = handlerInstance.queryUnionModelJSON(query)  # TODO: improve error handling
        return JSONResponse(json.loads(res), status_code=200)

# Static files for the demo app
app.mount(
    "/",
    StaticFiles(directory=join_path(dirname(dirname(dirname(abspath(__file__)))), 'CoViKoa-client/dist')),
    name="static",
)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Path to configuration file should be provided")
    with open(sys.argv[1]) as f:
        d = toml.loads(f.read())
        dirpath_config_path = Path(os.getcwd())

    makePathFile = lambda a: str(dirpath_config_path.joinpath(a).resolve())

    geosparqlFusekiProcess = makeGeosparqlFusekiProcess(
        makePathFile(d['geospatial-triplestore']['model']),
        makePathFile(d['geospatial-triplestore']['data']),
    ) if 'geospatial-triplestore' in d else None

    try:
        # Create an instance of our 'triplestore'
        # with SHACL (validation & rule execution) enabled
        # and GeoSPARQL enabled and load
        # all our vocabularies/ontologies/shacl-rules
        covikoa_vocabularies = [makePathFile(file_path) for file_path in d['covikoa-vocabularies']]
        data_model_files = [makePathFile(file_path) for file_path in d['target-semantic-data-model-files']]
        handlerInstance = CoViKoaHandler(
            covikoa_vocabularies,
            data_model_files,
            makePathFile(d['derivation-model']),
            False,
        )
    except:
        if geosparqlFusekiProcess:
            geosparqlFusekiProcess.terminate()
            geosparqlFusekiProcess.kill()
        raise
    uvicorn.run(app, host="0.0.0.0", port=8000)
