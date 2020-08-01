
import "isomorphic-fetch";
import {
  duplicatedEmail,
  invalidEmal,
  emailTooShort,
  passwordTooShort,
} from "./errorMessages";
import { startServer } from "../../startServer";
import { User } from "../../entity/User";
import { request } from "graphql-request";

let getHost = () => "";
const email = "test@test.by";
const password = "test1234";

beforeAll(async () => {
  const app = await startServer();
  // const port = app.port;
  const port = (app.address() as any).port;

  getHost = () => `http://localhost:${port}`;
  await User.delete({ email });
});

const mutation = (email: string, password: string) => `
  mutation {
    register(email: "${email}", password: "${password}") {
      path
      message
    }
  }
`;

describe("Register user", () => {
  it("successfull registration", async () => {
    const response = await request(getHost(), mutation(email, password));
    expect(response).toEqual({ register: null });
  
    const users = await User.find({ where: { email } });
    expect(users.length).toBe(1);
  
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  })

  it("duplicated email", async () => {
    const response2 = await request(getHost(), mutation(email, password));
  
    expect(response2.register).toHaveLength(1);
    expect(response2.register).toEqual([
      {
        message: duplicatedEmail,
        path: "email",
      },
    ]);
  })

  it("short email", async () => {
    const response = await request(getHost(), mutation("b", password));
    expect(response.register).toEqual([
      { message: emailTooShort, path: "email" },
      { message: invalidEmal, path: "email" },
    ]);
  })

  it("short pass", async () => {
    const response2 = await request(getHost(), mutation(email, "b"));
    expect(response2.register).toEqual([
      {
        message: passwordTooShort,
        path: 'password',
      }
    ])
  })

});
