import { User } from "./../entity/User";
import { startServer } from "./../startServer";
// const email = "test@test.by";

export default async () => {
  if (!process.env.TEST_HOST) {
    const app = await startServer();
    const { port } = app.address() as any;

    process.env.TEST_HOST = `http://localhost:${port}`;
    // await User.delete({ email });
  }
};
