<h1 align="center">
  <img src="assets/imgs/readme/main_screen.png" alt="io-dev-api-server"></a>
  <br>
  IO dev API server
  <br>
</h1>

<h4 align="center">Mock server of <a href="https://github.com/teamdigitale/io-backend">io-backend</a> for <a href=https://github.com/teamdigitale/io-app">io-app</a> development.</h4>

<p align="center">
  <a href="https://app.codecov.io/gh/pagopa/io-dev-api-server">
    <img src="https://codecov.io/gh/pagopa/io-dev-api-server/branch/master/graph/badge.svg"
         alt="codecov">
  </a>
</p>

## Table of contents
* [Features](#features)
* [Local setup](#local-setup)
* [Docker setup](#docker-setup)
* [Usage with the app](#usage-with-the-app)

## Features
The test server has been created to make the app development process easier and more productive. Therefore you can:
- Run it on local machines without an internet connection;
- Change response payloads to test and stress the app;
- Add new paths and handlers to integrate and test features not yet released;
- Understand flows and data exchanged between app and backend.

<details>
   <summary>Login</summary>
   The current login implementation by-passes SPID authentication: when the user asks for a login with a certain SPID Identity Provider, the server responses with a redirect containing the session token. The user will be immediately logged in.
   <br><br>
   <img src="assets/imgs/readme/login.gif" height="400" />
</details>

<details>
   <summary>Session</summary>
   When the client asks for a session, a valid session is always returned. Of course the developer could implement a logic to return an expired session response to test different scenarios.
</details>


## Local setup
We recommend the use of a virtual environment, [nodenv](https://github.com/nodenv/nodenv) is the chosen virtual environment for this guide, along with [yarn](https://yarnpkg.com/) for managing depencendices. From your command line, run:

```bash
# Clone this repository
$ git clone https://github.com/pagopa/io-dev-api-server

# CD into the repository
$ cd io-dev-api-server

# Install node with nodenv, the returned version should match the one in the .node-version file
$ nodenv install && nodenv version

# Install yarn and rehash to install shims
$ npm install -g yarn && nodenv rehash

# Install dependencies 
# Run this only while setting up and when dependencies change
$ yarn install

# Generate API definitions
# Run this only while setting up and when io-backend specs change
$ yarn generate

# Start the server
$ yarn start
```
***Note***: The default port (3000) can be changed in the [server.ts] file.
## Docker setup
A [Docker](https://www.docker.com/get-started) image is also available for local dev purposes. From your command line, run:
```bash
# Login into the github packages registry
# Reference: https://help.github.com/en/packages/using-github-packages-with-your-projects-ecosystem/configuring-npm-for-use-with-github-packages
$ docker login -u <YOUR_GITHUB_USERNAME> -p <GITHUB_TOKEN> docker.pkg.github.com

# Pull the latest Docker image 
# Other versions can be found here: https://github.com/pagopa/io-dev-api-server/pkgs/container/io-dev-api-server%2Fio-dev-api-server
$ docker pull ghcr.io/pagopa/io-dev-api-server/io-dev-api-server:latest

# Run the Docker container at http://127.0.0.1:<YOUR_HOST_PORT>/
$ docker run -d -p <YOUR_HOST_PORT>:3000 docker.pkg.github.com/pagopa/io-dev-api-server/io-dev-api-server:latest`
```

## Usage with the app
Run the server, either locally on via Docker. Then, from your command line:
```bash
# CD into the app folder
$ cd io-app

# Use the local env 
# You can edit the server endpoint on your needs
$ cp .env.local .env 

# Run the app on iOS or Android
$ yarn run-ios (or yarn-run-android)
```