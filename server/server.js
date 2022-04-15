const contextMiddleware = require("./util/contextMiddleware");
const { sequelize } = require("./models");

// // require('dotenv').config()
// // const resolvers = require('./graphql/resolvers')
// // const typeDefs = require('./graphql/typeDefs')

// // const server = new ApolloServer({
// //   typeDefs,
// //   resolvers,
// //   context: contextMiddleware,
// //   subscriptions: { path: '/' },

// // })

// // server.listen().then(({ url }) => {
// //   console.log(`🚀 Server ready at ${url}`)

// //   sequelize
// //     .authenticate()
// //     .then(() => console.log('Database connected!!'))
// //     .catch((err) => console.log(err))
// // })

// const contextMiddleware = require('./util/contextMiddleware')
// const { ApolloServer } = require("apollo-server-express");
// const { makeExecutableSchema } = require("@graphql-tools/schema");
// const resolvers = require('./graphql/resolvers')
// const typeDefs = require('./graphql/typeDefs')
// const express =require("express");
// const { sequelize } = require('./models')

// require("dotenv").config()

//  const app = express();

//  async function startServer() {
//    const apolloServer = new ApolloServer({
//      schema: makeExecutableSchema({ typeDefs, resolvers }),
//      context: contextMiddleware,
//      subscriptions: { path: '/graphql' },
//    });
//    await apolloServer.start();
//    sequelize
//    .authenticate()
//    .then(() => console.log('Database connected!!'))
//    .catch((err) => console.log(err))
//    apolloServer.applyMiddleware({ app, path: "/graphql" });
//  }
//  startServer();

//   app.listen(process.env.PORT || 4000, () => {
//      console.log(`Server Running here 👉 https://localhost:${process.env.PORT || 4000}`);
//   });
const { ApolloServer } = require("apollo-server-express");
const { createServer } = require("http");
const express = require("express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");

const { useServer } = require("graphql-ws/lib/use/ws");
const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/typeDefs");
// Create the schema, which will be used separately by ApolloServer and
// the WebSocket server.
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create an Express app and HTTP server; we will attach both the WebSocket
// server and the ApolloServer to this HTTP server.
const app = express();
const httpServer = createServer(app);

// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

// Save the returned server's info so we can shutdown this server later
const serverCleanup = useServer({ schema }, wsServer);

// Set up ApolloServer.
const server = new ApolloServer({
  schema,
  context: contextMiddleware,
  subscriptions: { path: '/graphql' },
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
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

  const PORT = 4000;
  // Now that our HTTP server is fully set up, we can listen to it.
  httpServer.listen(PORT, () => {
    console.log(
      `Server is now running on http://localhost:${PORT}${server.graphqlPath}`
    );
  });
  sequelize
    .authenticate()
    .then(() => console.log("Database connected!!"))
    .catch((err) => console.log(err));
})();
