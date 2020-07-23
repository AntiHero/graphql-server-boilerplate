import "reflect-metadata";
import 'graphql-import-node';
import * as typeDefs from './schema.graphql';
import { resolvers } from './resolvers';
import { GraphQLServer } from 'graphql-yoga';
import { createConnection } from "typeorm";

const server = new GraphQLServer({ typeDefs, resolvers });

createConnection().then(() => {
  server.start(() => console.log('Server is running on localhost:4000'))
});
