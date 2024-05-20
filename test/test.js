// Trong controllers
const jwt = require("jsonwebtoken");
const token = jwt.sign(
  {
    email: loadedUser.email,
    userId: loadedUser._id.toString(),
  },
  "somesupersecretsecret",
  { expiresIn: "1h" }
);
res.status(200).json({
  token: token,
  userId: loadedUser._id.toString(),
});

// Trong client
fetch(urlServer, {
  headers: {
    Authorization: "Bearer " + token,
  },
});

// Trong middleware
const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated!");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "somesupersecretsecret");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated!");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};

// Trong routes
const isAuth = require("..");
router.get("/posts", isAuth, feedController.getPosts);
