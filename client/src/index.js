import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import {ApolloClient,HttpLink,split} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
// import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import {ApolloProvider} from '@apollo/react-hooks';
import {InMemoryCache} from 'apollo-cache-inmemory';

import { AuthProvider } from './context/auth'
import { MessageProvider } from './context/message'

import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';


const wsLink = new GraphQLWsLink(createClient({
  url: `ws://localhost:4000/graphql`,	
  options: {
    reconnect: true,
    connectionParams: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
},
}));

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql/',
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})
// const wsLink = new WebSocketLink({
//   uri: `ws://localhost:4000/graphql/`,
//   options: {
//     reconnect: true,
//     connectionParams: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//     },
//   },
// })



const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})


createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <AuthProvider>
      <MessageProvider>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </MessageProvider>
    </AuthProvider>
  </ApolloProvider>
);

