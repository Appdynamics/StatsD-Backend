#
FROM ubuntu

ENV DEBIAN_FRONTEND=noninteractive
ENV AIRFLOW_HOME="/"
ENV USER="ddr"
ENV HOME_DIR="/home/"$USER
ENV TERM=linux

USER root
RUN apt-get update -yqq   &&  \
    apt-get upgrade -yqq  &&  \
    apt-get install -yqq  build-essential zip vim wget curl \
    net-tools iputils-ping sudo \
    git nodejs npm \
    python3 python3-pip

RUN adduser --disabled-password --gecos '' $USER && \
    adduser $USER sudo && \
    echo "$USER ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
USER $USER
WORKDIR $HOME_DIR

# https://statsd.readthedocs.io/en/v3.2.1/index.html
RUN pip3 install statsd

COPY Agents                     $HOME_DIR/Agents/
COPY *.sh                       $HOME_DIR/
COPY *.py                       $HOME_DIR/
COPY *.js                       $HOME_DIR/
COPY lib                        $HOME_DIR/lib/
COPY *.json                     $HOME_DIR/
#RUN git clone https://github.com/statsd/statsd.git
COPY statsd                     $HOME_DIR/statsd/
RUN sudo chown -R $USER:$USER   $HOME_DIR && sudo chmod -R +rw $HOME_DIR


ENV PATH="${PATH}:${HOME_DIR}/.local/bin:."
ENTRYPOINT [ "./start-container.sh" ]
CMD [ "hold" ]
