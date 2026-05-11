# StudySphere
CS 554 Project

## Prerequisites

- Node.js
- MongoDB 
- Redis - setup already within .env
- Firebase auth - setup already within .env

## Setup

### Seed the database

cd studysphere-server
npm run seed


### Server ('studysphere-server/')

put server.env in this directory and rename to .env

cd studysphere-server
npm install
npm run start

### Client ('studysphere-client/')

add client.env in this directory and rename to .env

cd studysphere-client
npm install
npm run build
npm run start

or 
"npm run dev" for development
