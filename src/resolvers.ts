import { User } from './entity/User';
import { ResolverMap } from './types/graphql-utils.d';
import * as bcrypt from 'bcryptjs';

export const resolvers: ResolverMap = {
  Query: {
    hello: (_, { name }: GQL.IHelloOnQueryArguments) => `Hello ${name || 'World'}`,
  },
  Mutation: {
    register: async (_, { email, password }: GQL.IRegisterOnMutationArguments) => {
      const hashedPasowprd = await bcrypt.hash(password, 10);
      const user =  User.create({
        email,
        password: hashedPasowprd,
      })
      
      await user.save();
      return true;
    }
  }
}
