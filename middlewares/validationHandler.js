import { body } from "express-validator";
import pool from "../db/pool.js";

const validateSignup = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 255 })
    .withMessage("First name must be between 2 and 255 characters")
    .isAlpha()
    .withMessage("First name must contain only letters"),

  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 255 })
    .withMessage("Last name must be between 2 and 255 characters")
    .isAlpha()
    .withMessage("Last name must contain only letters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email must not exceed 255 characters")
    .custom(async (value) => {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [value]
      );
      if (rows.length > 0) {
        throw new Error("Email already in use");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),

  body("confirm_password")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),
];

const validateMessage = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),

  body("text")
    .trim()
    .notEmpty()
    .withMessage("Message text is required")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message text must be between 1 and 1000 characters"),
];

export { validateSignup, validateLogin, validateMessage };
