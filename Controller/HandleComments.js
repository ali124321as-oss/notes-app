const commentsModel = require("../models/CommentsModel");
const postsModel = require("../models/PostsModel");

const createComment = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!req.params.postId) {
      return res.send({
        msg: "please enter post id ",
      });
    }
    const postId = req.params.postId;
    const findPost = await postsModel.findOne({
      postId: postId,
    });
    if (!findPost) {
      return rss.send({
        msg: "please enter valid postid",
      });
    }
    const AddComment = await commentsModel.create({
      comment: comment,
      postid: findPost.postId,
      userId: req.user._id,
    });

    if (!AddComment) {
      return rss.send({
        msg: "comment can not  be added ",
      });
    }

    return res.send({
      msg: "your comment added",
      comment: AddComment.comment,
    });
  } catch (error) {
    console.log(error);

    return res.send({
      msg: "some thing went wrong comment can not be added",
    });
  }
};

const updateComment = async (req, res) => {
  if (!req.params.postId) {
    return res.send({
      msg: "please enter post id",
    });
  }
  if (!req.params.commentId) {
    msg: "please enter comment id";
  }
  try {
    const postId = req.params.postId;
    const commentId = req.params.id;

    const { updatedComment } = req.body;
    const findComment = await commentsModel.findone({
      _id: commentId,
      userId: req.user._id,
      postId: postId,
    });

    if (!findComment) {
      return res.send({
        msg: "please  enter valid comment id ",
      });
    }
    let oldComment = findComment.comment;
    findComment.comment = updatedComment;
    await findComment.save();

    return res.send({
      msg: "comment updated Successfully",
      oldComment: oldComment,
      newComment: findComment.comment,
    });
  } catch (error) {
    return res.send({
      msg: "comment can not be updated",
    });
  }
};

const deleteComment = async (req, res) => {
  if (!req.params.postId) {
    return res.send({
      msg: "please enter post id",
    });
  }
  if (!req.params.commentId) {
    msg: "please enter comment id";
  }
  try {
    const postId = req.params.postId;
    const commentId = req.params.id;

    const findComment = await commentsModel.findone({
      _id: commentId,
      userId: req.user._id,
      postId: postId,
    });

    if (!findComment) {
      return res.send({
        msg: "please enter valid comment id",
      });
    }

    await findComment.deleteOne();
    return res.send({
      msg: "comment deleted successfully ",
    });
  } catch (error) {
    return res.send({
      msg: "comment can not be updated",
    });
  }
};

module.exports = {
  createComment,
  updateComment,
  deleteComment,
};
