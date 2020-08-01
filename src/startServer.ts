import { User } from "./entity/User";
import "graphql-import-node";
import "reflect-metadata";
import * as fs from "fs";
import { GraphQLSchema } from "graphql";
import { createTypeORMConnection } from "./utils/createTypeORMConnection";
import { importSchema } from "graphql-import";
import { ApolloServer } from "apollo-server-express";
import { join } from "path";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import * as express from "express";
import * as Redis from "ioredis";
import * as bodyParser from "body-parser";

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

  const redis = new Redis();

  await createTypeORMConnection();

  const server = new ApolloServer({
    schema: mergeSchemas({ schemas }),
    context: ({ req }) => ({
      redis,
      url: req.protocol + "://" + req.get("host"),
    }),
  });

  const app = express();

  const port = process.env.NODE_ENV === "test" ? 3000 : 4000;
  server.applyMiddleware({ app, path: "/" });

  app.get("/confirm/:id", async (req, res) => {
    const { id } = req.params;
    const userId = await redis.get(id);

    if (userId) {
      await User.update({ id: String(userId) as string }, { confirmed: true });
      res.send({ message: "email confirmed" });
    } else {
      res.send({ message: "bad request" });
    }
  });

  // const app = await server.listen({ port });
  const expressApp = await app.listen({ port });

  console.log(
    `Server is running on http://localhost:${port} in ${process.env.NODE_ENV} mode`
  );

  // return app;
  return expressApp;
};
