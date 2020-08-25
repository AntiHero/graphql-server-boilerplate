import { userSessionIdPrefix, redisSessionPrefix } from "../constants";
import { Redis } from "ioredis";

export const removeAllUserSessions = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(
    `${userSessionIdPrefix}${userId}`,
    0,
    -1
  );

  sessionIds.forEach(
    async (sessionId) => await redis.del(`${redisSessionPrefix}${sessionId}`)
  );
};
