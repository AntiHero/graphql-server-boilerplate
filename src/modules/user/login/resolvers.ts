import { userSessionIdPrefix } from './../../../constants';
import { failedLogin, failedConfirm, accountIsLocked } from "./errorMessages";
import { User } from "./../../../entity/User";
import { ResolverMap } from "./../../../@types/graphql-utils";
import * as bcrypt from "bcryptjs";

const errorResponse = (errorMessage: string) => [
  {
    path: "email",
    message: errorMessage,
  },
];

export const resolvers: ResolverMap = {
  // Query: {
  //   dummy: () => "dummy",
  // },
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session, redis, req }
    ) => {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return errorResponse(failedLogin);
      }

      if (!user.confirmed) {
        return errorResponse(failedConfirm);
      }

      if (user.restorePasswordLocked) {
        return errorResponse(accountIsLocked);
      }

      const valid = await bcrypt.compare(password, user.password as string);

      if (!valid) {
        return errorResponse(failedLogin);
      }

      // login success
      session.userId = user.id;
      
      if (req.sessionID) {
        await redis.lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID);
      }

      return null;
    },
  },
};
