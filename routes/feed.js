const express = require("express");
const { check, body } = require("express-validator");
const router = express.Router();

const feedController = require("../controllers/feed");

router.get("/getPosts", feedController.getPosts);
router.post("/getPost", feedController.getPost);
router.post(
  "/post",
  [
    body("title", "Please enter a title!")
      .isLength({ min: 1 })
      .isAlphanumeric(),
    body("content", "Please enter a content!")
      .isLength({ min: 1 })
      .isAlphanumeric(),
  ],
  feedController.createPost
);
router.post(
  "/editPost",
  [
    body("title", "Please enter a title!")
      .isLength({ min: 1 })
      .isAlphanumeric(),
    body("content", "Please enter a content!")
      .isLength({ min: 1 })
      .isAlphanumeric(),
  ],
  feedController.editPost
);
router.post("/deletePost", feedController.deletePost);

module.exports = router;
