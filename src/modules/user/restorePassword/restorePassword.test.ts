import { createTestConn } from './../../../testUtils/createTestConnection';
import { restorePasswordLockAccount } from '../../../utils/restorePasswordLockAccount';
import { passwordTooShortError, expiredKeyError } from "./errorMessages";
import { accountIsLocked } from "./../login/errorMessages";
import * as Redis from "ioredis";
import { createResotrePasswordEmailLink } from "../../../utils/createRestorePasswordEmailLink";
import { TestClient } from "../../../utils/TestClient";
import { User } from "../../../entity/User";
import { createTypeORMConnection } from "../../../utils/createTypeORMConnection";
import { Connection } from "typeorm";

let connection: Connection;
const redis = new Redis();
const email = "restore@gmail.com";
const password = "test1234";
const newPassword = "newPassword";

let userId: string = "";

beforeAll(async () => {
  connection = await createTestConn();

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

describe("forgot password", () => {
  test("send email and restore password", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await restorePasswordLockAccount(userId, redis);
    const url = await createResotrePasswordEmailLink("", userId, redis);

    const chunks = url.split("/");
    const key = chunks[chunks.length - 1];

    expect((await client.login(email, password)).data.data).toEqual({
      login: [
        {
          path: "email",
          message: accountIsLocked,
        },
      ],
    });

    expect((await client.restorePasswordChange("a", key)).data.data).toEqual({
      restorePasswordChange: [
        {
          path: "password",
          message: passwordTooShortError,
        },
      ],
    });

    const response = await client.restorePasswordChange(newPassword, key);

    expect(response.data.data).toEqual({
      restorePasswordChange: null,
    });

    expect(
      (await client.restorePasswordChange("newPassword2", key)).data.data
    ).toEqual({
      restorePasswordChange: [
        {
          path: "key",
          message: expiredKeyError,
        },
      ],
    });

    expect((await client.login(email, newPassword)).data.data).toEqual({
      login: null,
    });
  });
});
