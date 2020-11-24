# Image can be build like this :
#
# $ docker build -t "covikoa:latest" .
#
# App can be started like this (exposing port 8000 in the host):
#
# $ docker run --publish "8000:8000" -it "covikoa:latest" case-study-1.toml
#
# Access to a shell in the container can be obtained with a command like :
#
# $ docker run -it --entrypoint=/bin/bash "covikoa:latest"
#

FROM ubuntu:20.04

MAINTAINER Matthieu Viry <matthieu.viry@univ-grenoble-alpes.fr>

ENV TZ=Europe/Paris

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get -y update && apt-get -y upgrade

RUN apt-get install -y software-properties-common openjdk-11-jdk nodejs python3-pip

ENV LANG='fr_FR.UTF-8' LANGUAGE='fr_FR'

RUN mkdir /home/app

COPY *.toml /home/app/

COPY ./code /home/app/code

RUN python3 -m pip install -r /home/app/code/CoViKoa/py-wrapper/requirements.txt

COPY ./rdf /home/app/rdf

EXPOSE 8000

WORKDIR /home/app/

ENTRYPOINT ["python3", "code/CoViKoa/py-wrapper/server.py"]
