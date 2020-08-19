import { Redis } from 'ioredis';
import { uuid } from 'uuidv4';
// http://localhost:4000
// https://my-site.com => https://my-site.com/confirm<id> 
export const createConfirmEmailLink = async (url: string, userId: string, redis: Redis) => {
  const id = uuid();
  await redis.set(id, userId, "ex", 60* 60 * 24);

  return `${url}/confirm/${id}`;
};
