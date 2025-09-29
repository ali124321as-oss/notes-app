const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: "Notes App API",
    description: "API documentation for User and Notes routes"
  },
  host: "localhost:9005", 
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";

// Only include the root files where routes start
const endpointsFiles = [
  "./index.js",              // main entrypoint
  "./Routes/UserRoutes.js",  // user routes
  "./Routes/NotesRoute.js"   // notes routes
];

swaggerAutogen(outputFile, endpointsFiles, doc);
