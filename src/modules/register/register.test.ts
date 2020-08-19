import { TestClient } from './../../utils/TestClient';
import { Connection } from 'typeorm';
import { createTypeORMConnection } from './../../utils/createTypeORMConnection';

import "isomorphic-fetch";
import {
  duplicatedEmail,
  invalidEmal,
  emailTooShort,
  passwordTooShort,
} from "./errorMessages";
import { User } from "../../entity/User";

const email = "test@test.by";
const password = "test1234";

let connection: Connection;

beforeAll(async () => {
  connection = await createTypeORMConnection();
});

afterAll(async () => {
  connection.close();
});

describe("Register user", () => {
  it("successfull registration", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    
    const response = await client.register(email, password);
    expect(response.data.data).toEqual({ register: null });
  
    const users = await User.find({ where: { email } });
    expect(users.length).toBe(1);
  
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  })

  it("duplicated email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response2 = await client.register(email, password);
  
    expect(response2.data.data.register).toHaveLength(1);
    expect(response2.data.data.register).toEqual([
      {
        message: duplicatedEmail,
        path: "email",
      },
    ]);
  })

  it("short email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    
    const response = await client.register("b", password);
    expect(response.data.data.register).toEqual([
      { message: emailTooShort, path: "email" },
      { message: invalidEmal, path: "email" },
    ]);
  })

  it("short pass", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const response2 = await client.register(email, "b");
    expect(response2.data.data.register).toEqual([
      {
        message: passwordTooShort,
        path: 'password',
      }
    ])
  })

});
