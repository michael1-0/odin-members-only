import path, { join } from "node:path";
import express, { urlencoded, static as static_ } from "express";

import { errorHandler } from "./middlewares/errorHandler.js";
import { currentUserHandler } from "./middlewares/currentUserHandler.js";
import sessionHandler from "./middlewares/sessionHandler.js";
import passport from "./config/passport.js";

import bcrypt from "bcryptjs";
import { getSecret, getAdminSecret } from "./secret.js";
import pool from "./db/pool.js";

import {
  validateSignup,
  validateLogin,
} from "./middlewares/validationHandler.js";
import { matchedData, validationResult } from "express-validator";

const app = express();

app.set("view engine", "ejs");
app.set("views", join(import.meta.dirname, "views"));

app.use(urlencoded({ extended: false }));
app.use(static_(path.join(import.meta.dirname, "public")));
app.use(sessionHandler);
app.use(passport.session());
app.use(currentUserHandler);

app.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT messages.message_id, messages.title, messages.timestamp, messages.text, users.first_name, users.membership_status FROM messages JOIN users ON messages.user_id = users.user_id;"
    );
    res.render("index", { messages: rows });
  } catch (error) {
    next(error);
  }
});

app.get("/sign-up", (req, res) => res.render("sign-up", { errors: null }));
app.post("/sign-up", validateSignup, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("sign-up", { errors: errors.array() });
  }
  const body = matchedData(req);
  try {
    const hash = await bcrypt.hash(body.password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (first_name, last_name, password, email, membership_status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [body.first_name, body.last_name, hash, body.email, false]
    );
    const newUser = rows[0];
    req.logIn(newUser, (err) => {
      if (err) {
        throw err;
      }
      return res.redirect("/");
    });
  } catch (error) {
    next(error);
  }
});

app.get("/log-in", (req, res) => res.render("log-in", { errors: null }));
app.post(
  "/log-in",
  validateLogin,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("log-in", { errors: errors.array() });
    }
    next();
  },
  passport.authenticate("local", { successRedirect: "/", failureRedirect: "/" })
);
app.get("/log-out", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
});

app.get("/club", (req, res) => res.render("club"));
app.post("/club", async (req, res, next) => {
  if (req.isUnauthenticated()) {
    return res.redirect("/log-in");
  }
  const body = req.body;
  const serverSecret = getSecret();
  if (serverSecret !== body.secret) {
    return res.redirect("/club");
  }
  try {
    await pool.query(
      "UPDATE users SET membership_status = $1 WHERE user_id = $2",
      [true, req.user.user_id]
    );
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.get("/message", (req, res) => {
  if (req.isUnauthenticated()) {
    return res.redirect("/log-in");
  }
  res.render("message");
});
app.post("/message", async (req, res, next) => {
  if (req.isUnauthenticated()) {
    return res.redirect("/log-in");
  }
  const body = req.body;
  const currentUserId = req.user.user_id;
  try {
    await pool.query(
      "INSERT INTO messages (user_id, title, text, timestamp) VALUES ($1, $2, $3, $4)",
      [currentUserId, body.title, body.text, new Date().toISOString()]
    );
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});
app.post("/message/:id", async (req, res, next) => {
  if (req.isUnauthenticated()) {
    return res.redirect("/log-in");
  }
  if (!req.user.admin) {
    return res.redirect("/admin");
  }
  const messageId = req.params.id;
  try {
    await pool.query("DELETE FROM messages WHERE message_id = $1", [messageId]);
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.get("/admin", (req, res) => {
  if (req.isUnauthenticated()) {
    return res.redirect("/log-in");
  }
  if (req.user.admin) {
    return res.redirect("/");
  }
  res.render("admin");
});
app.post("/admin", async (req, res, next) => {
  if (req.isUnauthenticated()) {
    return res.redirect("/log-in");
  }
  if (req.user.admin) {
    return res.redirect("/");
  }
  const body = req.body;
  const serverSecret = getAdminSecret();
  if (serverSecret !== body.secret) {
    return res.redirect("/admin");
  }
  try {
    await pool.query("UPDATE users SET admin = $1 WHERE user_id = $2", [
      true,
      req.user.user_id,
    ]);
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

export { app };
