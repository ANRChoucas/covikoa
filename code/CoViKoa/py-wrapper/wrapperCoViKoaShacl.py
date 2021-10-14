#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
@author: mthh

Python wrapper around Java CoViKoaHandler class.

The file can be run using the `runfile('path/to/file.py')` function
of Spyder/PyCharm or the %run IPython magic command.
See in the file server.py how to instanciate the 'CoViKoaHandler'
to play with it using SPARQL in an interactive fashion
(also examples in docstring below).
"""
__all__ = ['CoViKoaHandler', 'Utils']

import os

dirpath = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
makePathResource = lambda x: os.path.join(dirpath, x)

# Needs to be set before importing 'autoclass' from pyjnius
if not 'JAVA_HOME' in os.environ:
    os.environ['JAVA_HOME'] = "/usr/lib/jvm/java-1.11.0-openjdk-amd64/"  # see `readlink -e $(whereis java)`
os.environ['CLASSPATH'] = makePathResource('target/CoViKoa-0.2.0-SNAPSHOT-jar-with-dependencies.jar')

from jnius import autoclass

# Wrap the java class
CoViKoaHandler = autoclass('org.me.CoViKoa.CoViKoaHandler')
Utils = autoclass('org.me.CoViKoa.Utils')

# Utils.saveModel(handlerInstance.getDataModel(), "/home/mthh/Bureau/test_save_model_0.ttl");

# It can now be used like this:
'''
import json

handlerInstance = CoViKoaHandler(['path/to/covikoa/files'], 'path/to/derivationModel.ttl')
result = handlerInstance.queryDataModelJSON("""
   prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   prefix ex:  <http://example.com/ns#>
   prefix oac: <http://purl.org/oac#>
   prefix gviz: <http://example.com/geoviz#>
   prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
   prefix geo: <http://www.opengis.net/ont/geosparql#>
   prefix geof: <http://www.opengis.net/def/function/geosparql/>

   SELECT  ?zir1 ?this ?cat
   WHERE {
       BIND(oac:ZIR1 as ?zir1).
       ?zir1 oac:a_geometrie [geo:asWKT ?geomZIR] .
       ?hypo oac:a_zone_initiale_de_recherche ?zir1 .
       ?hypo1 oac:a_indice [
               oac:a_cible [oac:a_categorie ?catCible] ;
       ] .

       ?this a oac:ObjetDuTerritoire .
       ?this oac:a_geometrie [geo:asWKT ?geomObjet] .
       FILTER(geof:sfIntersects(?geomZIR, ?geomObjet)) .
       ?this oac:a_categorie ?cat .
       FILTER(?cat != ?catCible) .
   }""")

result = json.loads(result)

#> {'head': {'vars': ['zir1', 'this', 'cat']},
#>  'results': {'bindings': [{
#>    'zir1': {'type': 'uri', 'value': 'http://purl.org/oac#ZIR1'},
#>    'this': {'type': 'uri', 'value': 'http://purl.org/oac#obj0002'},
#>    'cat': {'type': 'uri', 'value': 'http://purl.org/oac#CITY'}
#>  }]}}
'''
