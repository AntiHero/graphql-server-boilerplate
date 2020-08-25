import "reflect-metadata";
import "graphql-import-node";
import { redisSessionPrefix } from './constants';
import * as express from "express";
import { createSchema } from "./utils/createSchema";
import { confirmEmail } from "./routes/Email";
import { createTypeORMConnection } from "./utils/createTypeORMConnection";
import { ApolloServer } from "apollo-server-express";
import * as session from "express-session";
import redis from "./redis";
import * as dotenv from "dotenv";
import * as connectRedis from "connect-redis";

dotenv.config();

export const startServer = async () => {
  const RedisStore = connectRedis(session);

  const server = new ApolloServer({
    schema: createSchema(),
    context: ({ req }) => ({
      redis,
      url: req.protocol + "://" + req.get("host"),
      session: req.session,
      req,
    }),
  });

  const app = express();

  const port = process.env.NODE_ENV === "test" ? 3000 : 4000;

  app.use(
    session({
      store: new RedisStore({ client: redis as any, prefix: redisSessionPrefix }),
      name: "qid",
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  const cors = {
    credentials: true,
    origin: `http://localhost:${port}`,
  };

  app.use("/confirm/:id", confirmEmail);

  server.applyMiddleware({ app, path: "/", cors });

  await createTypeORMConnection();

  const expressApp = await app.listen({ port });

  console.log(
    `Server is running on http://localhost:${port} in ${process.env.NODE_ENV} mode`
  );

  return expressApp;
};
