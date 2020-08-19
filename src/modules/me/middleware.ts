import { logger } from './../../utils/logger';
import { User } from './../../entity/User';
import { Resolver } from "./../../@types/graphql-utils.d";

export default async (
  resolver: Resolver,
  parent: any,
  args: any,
  context: any,
  info: any,
) => {
  if (!context.session || !context.session.userId) {
    throw Error("no cookie");
  }
  
  const result = await resolver(parent, args, context, info);
  //afterware

  return result;
};
