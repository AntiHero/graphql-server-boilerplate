import { sendEmail } from "./../../utils/sendEmail";
import { createConfirmEmailLink } from "./../../utils/createConfirmEmailLink";
import { duplicatedEmail } from "./errorMessages";
import { formatYupErrors } from "../../utils/formatYupErrors";
import { User } from "../../entity/User";
import { ResolverMap } from "../../@types/graphql-utils";
import * as bcrypt from "bcryptjs";
import * as yup from "yup";

const schema = yup.object().shape({
  email: yup.string().min(3).max(255).email(),
  password: yup.string().min(6).max(255),
});

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy",
  },
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments,
      { redis, url }
    ) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatYupErrors(err);
      }

      const { email, password } = args;
      
      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"],
      });

      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: duplicatedEmail,
          },
        ];
      }

      const user = User.create({
        email,
        password,
      });

      await user.save();

      if (process.env.NODE_ENV !== 'test') {
        await sendEmail(
          email,
          await createConfirmEmailLink(url, user.id, redis)
        );
      }

      return null;
    },
  },
};
