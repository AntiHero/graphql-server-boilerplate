import { removeAllUserSessions } from './../../utils/removeAllUserSessions';
import { userSessionIdPrefix, redisSessionPrefix } from './../../constants';
import { ResolverMap } from "../../@types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy",
  },
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      // return await new Promise((resolve) =>
      //     session.destroy((err) => {
      //       if (err) {
      //         throw new Error(err);
      //       }
      //       resolve(true)
      //     })
      // );
      const { userId } = session;

      if (userId) {
        removeAllUserSessions(userId, redis);
        return true;
      } else {
        return false;
      }
    },
  },
};
