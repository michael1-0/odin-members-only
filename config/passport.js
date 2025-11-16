import LocalStrategy from "passport-local";
import passport from "passport";
import bcrypt from "bcryptjs";
import pool from "../db/pool.js";

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      const user = rows[0];
      
      if (!user) {
        return done(null, false, { message: "Incorrect email" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);
passport.serializeUser((user, done) => {
  return done(null, user.user_id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [id]
    );
    const user = rows[0];
    return done(null, user);
  } catch (error) {
    return done(error);
  }
});

export default passport;
