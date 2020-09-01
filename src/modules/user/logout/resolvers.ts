import { removeAllUserSessions } from './../../../utils/removeAllUserSessions';
import { ResolverMap } from "./../../../@types/graphql-utils";
// import { userSessionIdPrefix, redisSessionPrefix } from './../../../constants';

export const resolvers: ResolverMap = {
  // Query: {
  //   dummy: () => "dummy",
  // },
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
