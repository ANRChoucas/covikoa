from shlex import split
from subprocess import Popen, PIPE
from typing import AnyStr
from os.path import abspath, dirname, join as join_path

__all__ = ['makeGeosparqlFusekiProcess']

def makeGeosparqlFusekiProcess(modelPath: AnyStr, dataPath: AnyStr):
    geosparqlFusekiProcess = Popen(
        split(f'java -jar target/ServiceGeoSparqlObjetTerritoire-1.0-SNAPSHOT-jar-with-dependencies.jar {modelPath} {dataPath}'),
        cwd=join_path(dirname(dirname(dirname(abspath(__file__)))), 'ServiceGeoSparqlObjetTerritoire'),
        stderr=PIPE,
        stdout=PIPE,
    )

    while True:
        stdout = geosparqlFusekiProcess.stdout.readline()
        if b'Start Fuseki' in stdout:
            print(stdout.decode())
            break

    return geosparqlFusekiProcess
