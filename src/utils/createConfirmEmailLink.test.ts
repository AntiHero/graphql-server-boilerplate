import * as Redis from "ioredis";
import fetch from "node-fetch";
import { User } from "./../entity/User";
import { createTypeORMConnection } from "./createTypeORMConnection";
import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { Connection } from "typeorm";

let userId = "";
const redis = new Redis();

let connection: Connection;

beforeAll(async () => {
  connection = await createTypeORMConnection();
  const user = await User.create({
    email: "cowboy@gmail.com",
    password: "test1234",
  }).save();

  userId = user.id;
});

afterAll(async () => {
  connection.close();
});

test("Make sure user in confirmed and key in redis is cleared", async () => {
  const url = await createConfirmEmailLink(
    process.env.TEST_HOST as string,
    userId,
    redis
  );

  const response = await fetch(url);
  const text = await response.text();
  expect(text).toEqual(JSON.stringify({ message: "email confirmed" }));

  const user = await User.findOne({ where: { id: userId } });
  expect((user as any).confirmed).toBeTruthy();

  const chunks = url.split("/");
  const key = chunks[chunks.length - 1];
  expect(await redis.get(key)).toBeNull();
});
