import * as fs from "fs";
import { join } from "path";
import { makeExecutableSchema, mergeTypeDefs, mergeResolvers } from "graphql-tools";
import * as glob from "glob";
// import { importSchema } from "graphql-import";
// import { GraphQLSchema } from "graphql";

export const createSchema = () => {
  const pathToModules = join(__dirname, "../modules");
  console.log(pathToModules, 'path');
  const graphqlTypes = glob
    .sync(`${pathToModules}/**/*.graphql`)
    .map(x => fs.readFileSync(x, { encoding: "utf8"}));

  const resolvers = glob
    .sync(`${pathToModules}/**/resolvers.?s`)
    .map(resolver => require(resolver).resolvers);

  return makeExecutableSchema({
    typeDefs: mergeTypeDefs(graphqlTypes),
    resolvers: mergeResolvers(resolvers),
  })

  // const folders = fs.readdirSync(join(__dirname, "../modules"));
  // const schemas: GraphQLSchema[] = [];

  // folders.forEach((folder) => {
  //   const { resolvers } = require(`../modules/${folder}/resolvers`);
  //   const typeDefs = importSchema(
  //     join(__dirname, `../modules/${folder}/schema.graphql`)
  //   );
  //   schemas.push(makeExecutableSchema({ typeDefs, resolvers }));
  // });

  // return mergeSchemas({ schemas });
};
