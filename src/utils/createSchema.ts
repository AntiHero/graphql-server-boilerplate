import { GraphQLSchema } from "graphql";
import * as fs from "fs";
import { join } from "path";
import { makeExecutableSchema, mergeSchemas } from "graphql-tools";
import { importSchema } from "graphql-import";

export const createSchema = () => {
  const folders = fs.readdirSync(join(__dirname, "../modules"));
  const schemas: GraphQLSchema[] = [];

  folders.forEach((folder) => {
    const { resolvers } = require(`../modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      join(__dirname, `../modules/${folder}/schema.graphql`)
    );
    schemas.push(makeExecutableSchema({ typeDefs, resolvers }));
  });

  return mergeSchemas({ schemas });
};
