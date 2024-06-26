require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const session = require("express-session");

const path = require("path");
const fs = require("fs");
const https = require("https");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
// const job14minutes=require("./cron");

const sessionStore = require("./util/sessionStore");
const User = require("./models/user");

const authRoutes = require("./routes/auth");
const feedRoutes = require("./routes/feed");

const mongodbUri = process.env.MONGO_URL;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    // cb(null, file.originalname);
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const app = express();

// app.use(cors());

app.use(
  cors({
    origin: ["https://lab23-01-client-app.web.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// app.use(
//   cors({
//     origin: ["https://lab23-01-client-app.web.app", "http://localhost:3000"],
//     // origin: "https://lab23-01-client-app.web.app",
//     // origin: ["*", "http://localhost:3000"],
//     // origin: "http://localhost:3000",
//     credentials: true,
//   })
// );

app.use(bodyParser.json());

// app.use((req, res, next) => {
//   res.setHeader(
//     "Access-Control-Allow-Origin",
//     "https://lab23-01-client-app.web.app"
//   );
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
//   next();
// });

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("imageFile")
);

app.use("/images", express.static("images")); // Cần tạo thư mục images

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: false,
    },
    store: sessionStore,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;

      next();
    })
    .catch((err) => {
      console.log("app.js User.findById err:", err);
    });
});

app.use(authRoutes);
app.use(feedRoutes);

mongoose
  .connect(mongodbUri)
  .then((result) => {
    const server = app.listen(process.env.PORT || 5000);
    // const server = app.listen(5000);
    const io = require("./socket").init(server);
    // console.log("Server connected!");
    io.on("connection", (socket) => {
      console.log("Client connected!");
    });
  })
  .catch((err) => {
    console.log("mongoose connect error:", err);
  });
