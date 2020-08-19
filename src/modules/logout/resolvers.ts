import { ResolverMap } from "../../@types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy",
  },
  Mutation: {
    logout: async (_, __, { session }) => {
      return await new Promise((resolve) =>
          session.destroy((err) => {
            if (err) {
              throw new Error(err);
            }
            resolve(true)
          })
      );
    },
  },
};
