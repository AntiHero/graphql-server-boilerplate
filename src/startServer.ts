import "graphql-import-node";
import "reflect-metadata";
import * as fs from "fs";
import { GraphQLSchema } from 'graphql';
import { createTypeORMConnection } from "./utils/createTypeORMConnection";
import { importSchema } from "graphql-import";
import { ApolloServer } from "apollo-server";
import { join } from "path";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";

export const startServer = async () => {
  const folders = fs.readdirSync(join(__dirname, "./modules"));
  const schemas: GraphQLSchema[] = [];
  folders.forEach((folder) => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      join(__dirname, `./modules/${folder}/schema.graphql`)
    );
    schemas.push(makeExecutableSchema({ typeDefs, resolvers }));
  });

  const typeDefs = importSchema(
        join(__dirname, `./modules/register/schema.graphql`)
      );
  const server = new ApolloServer({ schema: mergeSchemas({ schemas }) } );

  await createTypeORMConnection();

  const port = process.env.NODE_ENV === "test" ? 3000 : 4000;
  const app = await server.listen({ port });

  console.log(
    `Server is running on http://localhost:${port} in ${process.env.NODE_ENV} mode`
  );

  return app;
};
