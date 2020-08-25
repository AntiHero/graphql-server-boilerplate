import "isomorphic-fetch";
import { TestClient } from './../../utils/TestClient';
import { User } from "./../../entity/User";
import { Connection } from "typeorm";
import { createTypeORMConnection } from "./../../utils/createTypeORMConnection";
import { failedLogin, failedConfirm } from "./errorMessages";

const email = "test@test.by";
const password = "test1234";

let connection: Connection;

beforeAll(async () => {
  connection = await createTypeORMConnection();
});

afterAll(async () => {
  connection.close();
});

describe("login", () => {
  test("email not found", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const response = await client.login("test@fail.com", "test1234")

    expect(response.data.data).toEqual({
      login: [
        {
          path: "email",
          message: failedLogin,
        },
      ],
    });
  });

  test("email not confirmed", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const response = await client.register(email, password);

    expect(response.data.data).toEqual({
      register: null,
    });

    const response2 = await client.login(email, password);

    expect(response2.data.data).toEqual({
      login: [
        {
          path: "email",
          message: failedConfirm,
        },
      ],
    });
  });

  test("bad password", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await User.update({ email }, { confirmed: true });

    const response = await client.login(email, 'test3333');

    expect(response.data.data).toEqual({
      login: [
        {
          path: "email",
          message: failedLogin,
        },
      ],
    });
  });

  test("login success", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const response = await client.login(email, password);

    expect(response.data.data).toEqual({
      login: null
    });
  })
});
