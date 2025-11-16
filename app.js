import path, { join } from "node:path";
import express, { urlencoded, static as static_ } from "express";

import { errorHandler } from "./middlewares/errorHandler.js";
import { currentUserHandler } from "./middlewares/currentUserHandler.js";
import sessionHandler from "./middlewares/session.js";
import passport from "./config/passport.js";

import bcrypt from "bcryptjs";
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

app.get("/", (req, res) => res.render("index", { user: req.user }));

app.get("/sign-up", (req, res) => res.render("sign-up", { errors: null }));
app.post("/sign-up", validateSignup, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("sign-up", { errors: errors.array() });
  }
  const body = matchedData(req);
  try {
    const hash = await bcrypt.hash(body.password, 10);
    await pool.query(
      "INSERT INTO users (first_name, last_name, password, email, membership_status) VALUES ($1, $2, $3, $4, $5)",
      [body.first_name, body.last_name, hash, body.email, false]
    );
    return res.redirect("/");
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

app.use(errorHandler);

export { app };
