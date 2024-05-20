const express = require("express");
const { check, body } = require("express-validator");
const bcrypt = require("bcryptjs");

const router = express.Router();

const User = require("../models/user");

const authControllers = require("../controllers/auth");

router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email!")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          console.log("userDoc login:", userDoc);
          if (!userDoc) {
            return Promise.reject("This account is not existed!");
          }
        });
      }),

    body("password").custom(async (value, { req }) => {
      const userDoc = await User.findOne({ email: req.body.email });
      console.log("userDoc:", userDoc);
      const doMatch = await bcrypt.compare(value, userDoc.password);
      console.log("doMatch:", doMatch);
      if (!doMatch) {
        throw new Error("Password is not correct!");
      }

      return true;
    }),
  ],
  authControllers.postLogin
);

router.post("/logout", authControllers.postLogout);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email!")
      .custom((value, { req }) => {
        //   if (value === "test@test.com") {
        //     throw new Error("This email address is tested for custom!");
        //   }
        //   return true;
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email exists already, please pick a different one!"
            );
          }
        });
      }),
    body("name", "Please enter a name!").isLength({ min: 1 }).isAlphanumeric(),
    body(
      "password",
      "Please enter password only numbers and text and at least 3 characters!"
    )
      .isLength({ min: 3 })
      .isAlphanumeric(),
  ],
  authControllers.postSignup
);

module.exports = router;
