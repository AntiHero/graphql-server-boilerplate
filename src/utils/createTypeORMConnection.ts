import { createConnection, getConnectionOptions } from "typeorm";

export const createTypeORMConnection = async () => {
  const connectinOptions = await getConnectionOptions(process.env.NODE_ENV);
  return createConnection({ ...connectinOptions, name: "default" } as any);
};
