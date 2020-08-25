import { User } from "./../entity/User";
import { removeAllUserSessions } from "./removeAllUserSessions";
import { Redis } from "ioredis";

export const restorePasswordLockAccount = async (
  userId: string,
  redis: Redis
) => {
  // User can't login while restoring pass
  await User.update({ id: userId }, { restorePasswordLocked: true });
  await removeAllUserSessions(userId, redis);
};
