import { Pool } from "pg";
import { config } from "dotenv";

config();

export default new Pool({ connectionString: process.env.PG_STRING });
