import express, { urlencoded, static as static_ } from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import path, { join } from "node:path";

const app = express();

app.set("view engine", "ejs");
app.set("views", join(import.meta.dirname, "views"));

app.use(urlencoded({ extended: false }));
app.use(static_(path.join(import.meta.dirname, "public")));
// app.use(session)
// app.use(passport.session())

app.get("/", (req, res) => res.render("index"));

app.use(errorHandler);

export { app };
