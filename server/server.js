const contextMiddleware = require("./util/contextMiddleware");
const { sequelize } = require("./models");
const { ApolloServer } = require("apollo-server-express");
const { createServer } = require("http");
const express = require("express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
require('dotenv').config()

const { useServer } = require("graphql-ws/lib/use/ws");
const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/typeDefs");
const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  context: contextMiddleware,
  subscriptions: { path: '/graphql' },
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

(async () => {
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  httpServer.listen(process.env.PORT || 4000, () => {
    console.log(
      `Server is now running on http://localhost:${process.env.PORT || 4000}${server.graphqlPath}`
    );
  });
  sequelize
    .authenticate()
    .then(() => console.log("Database connected!!"))
    .catch((err) => console.log(err));
})();
