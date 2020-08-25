import { formatYupErrors } from "./../../utils/formatYupErrors";
import { registerPasswordValidation } from "./../../yupSchema";
import { restorePasswordPrefix } from "./../../constants";
import { userNotFoundError, expiredKeyError } from "./errorMessages";
import { User } from "./../../entity/User";
import { createResotrePasswordEmailLink } from "./../../utils/createRestorePasswordEmailLink";
import { restorePasswordLockAccount } from "./../../utils/restorePasswordLockAccount";
import { ResolverMap } from "./../../@types/graphql-utils.d";
import * as yup from "yup";
import * as bcrypt from 'bcryptjs';

const schema = yup.object().shape({
  email: yup.string().min(3).max(255).email(),
  password: registerPasswordValidation,
});

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy",
  },
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis }
    ) => {
      const userId = (await User.findOne({ where: { email } }))?.id;

      if (!userId) {
        return [
          {
            path: "email",
            message: userNotFoundError,
          },
        ];
      }

      await restorePasswordLockAccount(userId, redis);
      await createResotrePasswordEmailLink("", userId, redis);

      return true;
    },

    restorePasswordChange: async (
      _,
      { password, key }: GQL.IRestorePasswordChangeOnMutationArguments,
      { redis }
    ) => {
      const redisKey = `${restorePasswordPrefix}${key}`

      const userId = await redis.get(redisKey) as string;

      if (!userId) {
        return [
          {
            path: "key",
            message: expiredKeyError,
          },
        ];
      }

      try {
        await schema.validate({ password }, { abortEarly: false });
      } catch (err) {
        return formatYupErrors(err);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const updatePromise = User.update(
        { id : userId },
        { restorePasswordLocked: false, password: hashedPassword }
      );

      const deletePromise = redis.del(redisKey);

      await Promise.all([updatePromise, deletePromise]);

      return null;
    },
  },
};
