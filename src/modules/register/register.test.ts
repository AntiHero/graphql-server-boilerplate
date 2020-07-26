import "isomorphic-fetch";
import { startServer } from '../../startServer';
import { User } from '../../entity/User';
import { request } from 'graphql-request';

let getHost = () => '';

beforeAll(async() => {
  const app = await startServer();
  const port = app.port;
  getHost = () => `http://localhost:${port}`;
})

const email = "test@test.by";
const password = "test";

const mutation = `
  mutation {
    register(email: "${email}", password: "${password}")
  }
`;

test("Register user", async () => {
  await User.delete({email});
  
  const response = await request(getHost(), mutation);
  expect(response).toEqual({ register: true });

  const users = await User.find({where: { email }});
  expect(users.length).toBe(1);

  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});
