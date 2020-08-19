import { TestClient } from './../../utils/TestClient';
import { User } from "../../entity/User";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";
import { Connection } from "typeorm";
import axios from "axios";

let connection: Connection;

const email = "logout@gmail.com";
const password = "test1234";

let userId: string = '';

beforeAll(async () => {
  connection = await createTypeORMConnection();

  const user = await User.create({
    email,
    password,
    confirmed: true,
  }).save();

  userId = user.id;
});

afterAll(async () => {
  connection.close();
});

describe("logout", () => {
  test("test loggin out a user", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await client.login(email, password);
  
    const response1 = await client.me();

    expect(response1.data.data).toEqual({
      me: {
        id: userId,
        email,
      }
    });

    const response2 = await client.logout();

    expect(response2.data.data.logout).toBeTruthy();

    const response3 = await client.me();

    expect(response3.data.data).toEqual({
      me: null
    });
  });
});
