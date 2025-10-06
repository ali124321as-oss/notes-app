const express = require("express");
const PostsRouter = express.Router();
const {
  createpost,
  getallPosts,
  updateUserPosts,
  deletePosts,
  getSinglePost,
  getAllpostsData
} = require("../Controller/HandlePost");
const { createStorage } = require("../uploadimagehandler");
const multer = require("multer");
const upload = multer({ storage: createStorage("postsImages") });
const {
  textValidator,
  fileValidator,
  validationMiddleware,
} = require("../expressValidator/allValidatons");

PostsRouter.post(
  "/posts",
  upload.single("PostImage"),
  [
    textValidator("title"),
    textValidator("content"),
    fileValidator("PostImage"),
  ],
  validationMiddleware,
  createpost
);

PostsRouter.get("/posts", getallPosts);
      PostsRouter.get("/posts/feed",getAllpostsData)
PostsRouter.delete("/posts/delete/:postId", deletePosts);
PostsRouter.get("/posts/:postId", getSinglePost);

PostsRouter.patch(
  "/update/postId",
  upload.single("postImage"),
  updateUserPosts
);
module.exports = PostsRouter;
