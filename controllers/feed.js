const User = require("../models/user");

const Post = require("../models/post");

const sessionStore = require("../util/sessionStore");
const io = require("../socket");
const imageDelete = require("../util/imageRemove");

const { validationResult } = require("express-validator");

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      const sortPosts = posts.sort((a, b) => {
        return b.date - a.date;
      });
      console.log("getPosts OK!");
      res.status(200).json(sortPosts);
    })
    .catch((err) => {
      console.log("Post.find err:", err);
      res.status(500).json({
        message: "Something went wrong!",
      });
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.body.postId;
  console.log("postId:", postId);
  Post.findById(postId)
    .then((post) => {
      console.log("getPost Succeed!");
      res.status(200).json(post);
    })
    .catch((err) => {
      console.log("err getPost:", err);
      res.status(500).json({
        message: "Something went wrong!",
      });
    });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  const imageFile = req.file;
  const imageUrl = imageFile ? imageFile.path : null;

  // const sessionId = req.body.sessionId;

  const errors = validationResult(req);

  console.log("title:", title);
  console.log("content:", content);
  console.log("imageFile:", imageFile);
  console.log("imageUrl:", imageUrl);

  // console.log("sessionId:", sessionId);

  if (!errors.isEmpty()) {
    console.log("errors.array()[0]:", errors.array()[0]);
    res.status(422).json(errors.array()[0]);
    return;
  }

  // if (!sessionId) {
  //   res.status(403).json({
  //     message: "Not authorized!",
  //   });
  // } else
  if (!imageFile || !imageUrl) {
    res.status(402).json({
      message: "Please choose the file is an image!",
    });
  } else {
    const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      date: new Date(),
      // creator: session.user,
    });

    post
      .save()
      .then((result) => {
        console.log("Post successfully!");
        res.status(201).json(result);
      })
      .catch((err) => {
        console.log("post.save err:", err);
        res.status(500).json({
          message: "Something went wrong!",
        });
      });

    io.getIo().emit("posts", { action: "create", post: post });
  }
};

exports.deletePost = (req, res, next) => {
  const postId = req.body.postId;

  console.log("postId delete:", postId);

  Post.findByIdAndDelete(postId)
    .then((result) => {
      console.log("result of postDelete:", result);
      imageDelete.deleteFile(result.imageUrl);
      // io.getIo().emit("posts", { action: "delete" });
      io.getIo().emit("posts", { action: "delete", postDelete: result });
      res.status(201).json({
        message: "Deleted the post!",
      });
    })
    .catch((err) => {
      console.log("err deletePost:", err);
      res.status(500).json({
        message: "Something went wrong!",
      });
    });
};

exports.editPost = (req, res, next) => {
  const postId = req.body.postId;
  const title = req.body.title;
  const content = req.body.content;
  const imageFile = req.file;
  const imageUrl = imageFile ? imageFile.path : null;

  // const sessionId = req.body.sessionId;

  const errors = validationResult(req);

  console.log("postId:", postId);
  console.log("title:", title);
  console.log("content:", content);
  console.log("imageFile:", imageFile);
  console.log("imageUrl:", imageUrl);

  // console.log("sessionId:", sessionId);

  if (!errors.isEmpty()) {
    res.status(422).json(errors.array()[0]);
    return;
  }

  if (!imageUrl) {
    res.status(422).json({
      message: "The file is not an image!",
    });
    return;
  }

  Post.findById(postId)
    .then((post) => {
      post.title = title;
      imageDelete.deleteFile(post.imageUrl);
      post.imageUrl = imageUrl;

      post.content = content;

      return post.save();
    })
    .then((result) => {
      io.getIo().emit("posts", { action: "update", post: result });
      res.status(201).json({ message: "Updated successfully!" });
    })
    .catch((err) => {
      console.log(err);
      // const error=new Error(err);
      // error.httpStatusCode=500;
      // return next(error); // error sẽ được gửi đến khối code tiếp theo để xử lý
      res.status(500).json({
        message: "Something went wrong!",
      });
    });
};
