const { ApolloServer } = require('apollo-server')
const contextMiddleware = require('./util/contextMiddleware')

const { sequelize } = require('./models')

require('dotenv').config()
const resolvers = require('./graphql/resolvers')
const typeDefs = require('./graphql/typeDefs')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleware,
  subscriptions: { path: '/' },

})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)

  sequelize
    .authenticate()
    .then(() => console.log('Database connected!!'))
    .catch((err) => console.log(err))
})
