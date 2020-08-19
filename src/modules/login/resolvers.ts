import { failedLogin, failedConfirm } from "./errorMessages";
import { User } from "../../entity/User";
import { ResolverMap } from "../../@types/graphql-utils";
import * as bcrypt from "bcryptjs";

const errorResponse = (errorMessage: string) => [
  {
    path: "email",
    message: errorMessage,
  },
];

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy",
  },
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session }
    ) => {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return errorResponse(failedLogin);
      }

      if (!user.confirmed) {
        return errorResponse(failedConfirm);
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return errorResponse(failedLogin);
      }

      // login success
      session.userId = user.id;
      
      return null;
    },
  },
};