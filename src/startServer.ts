import { Connection } from 'typeorm';
import { createTestConn } from './testUtils/createTestConnection';
import { User } from "./entity/User";
import "reflect-metadata";
import "graphql-import-node";
import { redisSessionPrefix } from "./constants";
import * as express from "express";
import { createSchema } from "./utils/createSchema";
import { confirmEmail } from "./routes/Email";
import { createTypeORMConnection } from "./utils/createTypeORMConnection";
import { ApolloServer } from "apollo-server-express";
import * as session from "express-session";
import redis from "./redis";
import * as dotenv from "dotenv";
import * as connectRedis from "connect-redis";
import * as rateLimit from "express-rate-limit";
import * as RateLimitRedisStore from "rate-limit-redis";
import * as passport from "passport";
import { Strategy } from "passport-google-oauth20";

dotenv.config();

export const startServer = async () => {
  const port = process.env.NODE_ENV === "test" ? 3000 : 4000;

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

  const cors = {
    credentials: true,
    origin: `http://localhost:${port}`,
  };

  let connection: Connection;

  if (process.env.NODE_ENV === "test") {
    connection = await createTestConn(true);
  } else {
    connection = await createTypeORMConnection();
  }

  passport.use(
    new Strategy(
      {
        clientID: process.env.GOOGLE_CONSUMER_KEY as string,
        clientSecret: process.env.GOOGLE_CONSUMER_SECRET as string,
        callbackURL: `http://localhost:${port}/auth/google/callback`,
      },
      async (_, __, profile, done) => {
        const { id, emails } = profile;

        const query = await connection
          .getRepository(User)
          .createQueryBuilder("user")
          .where('user.googleId = :id', { id });

        let email: string | null = null;

        if (emails) {
          email = emails[0].value;
          await query.orWhere("user.email = :email", { email }).getOne();
        }

        let user = await query.getOne();

        // this user needs to be registered
        if (!user) {
          user = await User.create({
            googleId: id,
            email
          }).save();
        } else if(!user.googleId) {
          // found user by email
          user.googleId = id;
          await user.save();
        } 

        return done(undefined, { id: user.id });

        // User.findOne({ googleId: profile.id }, function (err, user) {
        //   return done(err, user);
        // });
      }
    )
  );

  const app = express();

  app.use(
    rateLimit({
      store: new RateLimitRedisStore({
        client: redis,
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    })
  );

  app.use(passport.initialize());

  app.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix,
      }),
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

  app.use("/confirm/:id", confirmEmail);

  // We are using sessions ourselves
  // app.use(passport.session());

  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
    })
  );

  // GET /auth/google/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
      (req.session as any).userId = (req.user as User).id

      // @todo redirect to frontend
      res.redirect("/");
    }
  );

  server.applyMiddleware({ app, path: "/", cors });

  const expressApp = await app.listen({ port });

  console.log(
    `Server is running on http://localhost:${port} in ${process.env.NODE_ENV} mode`
  );

  return expressApp;
};
