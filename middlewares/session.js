import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pool from "../db/pool.js";
import { config } from "dotenv";

config();

const sessionStore = connectPgSimple(session);
const sessionHandler = session({
  store: new sessionStore({
    pool: pool,
  }),
  secret: process.env.SESS_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
});

export default sessionHandler;
