const User = require("../models/user");

const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator");

const sessionStore = require("../util/sessionStore");

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  console.log("email login:", email);
  console.log("password login:", password);
  console.log("errors login:", errors);

  if (!errors.isEmpty()) {
    res.status(422).json(errors.array()[0]);
    return;
  }
  console.log("OKKK");

  User.findOne({ email: email })
    .then((userDoc) => {
      req.session.isLoggedIn = true;
      req.session.user = userDoc;

      res.status(201).json(req.session.user);
      console.log(req.session);
    })
    .catch((err) => {
      console.log("login err:", err);

      res.status(500).json({
        message: "Something went wrong!",
      });
    });
};

exports.postLogout = (req, res, next) => {
  const sessionId = req.body.sessionId;

  console.log("sessionId postLogout:", sessionId);

  // --- Xóa 1 session với sessionId----------------------------------
  sessionStore.destroy(sessionId, (err) => {
    if (err) {
      console.log(err);

      res.status(500).json({
        message: "Something went wrong!",
      });
    }
    console.log("Session is destroyed!");
    res.status(201).json({
      message: "You are logout!",
    });
  });
  // ------------------------------------------------------------------
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  const errors = validationResult(req);

  console.log("postSignup email:", email);
  console.log("postSignup name:", name);
  console.log("postSignup password:", password);

  console.log("postSignup errors:", errors);

  if (!errors.isEmpty()) {
    console.log("errors.array()[0]", errors.array()[0]);
    res.status(422).json(errors.array()[0]);
    return;
  }

  bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      const user = new User({
        email: email,
        password: hashPassword,
        cart: { items: [] },
      });
      return user.save();
    })

    .then((result) => {
      res.status(201).json({
        message: "Register successfully!",
      });
    })
    .catch((err) => {
      console.log("send email error:", err);

      res.status(500).json({
        message: "Something went wrong!",
      });
    });
};
