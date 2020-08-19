import { join } from "path";
import { createSchema } from "../utils/createSchema";
import { generateNamespace } from "@gql2ts/from-schema";
import * as fs from "fs";

fs.writeFile(
  join(__dirname, "../@types/schema.d.ts"),
  generateNamespace("GQL", createSchema()),
  (e) => {
    if (e) {
      console.log(e, "schema creation fail");
    } else {
      console.log("schema created");
    }
  }
);
