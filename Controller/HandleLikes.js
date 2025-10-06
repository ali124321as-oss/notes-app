const likesModel = require("../models/likesModel");
const postsModel = require("../models/PostsModel");

const LikePosts = async (req, res) => {
  if (!req.params.postId) {
    return res.send({
      msg: "please enter post id ",
    });
  }

  try {
    const postId = req.params.postId;

    const findPost = await postsModel.findOne({
      postId:postId
    });

     console.log("find post:",findPost);
     

    if (!findPost) {
      return res.send({
        msg: `there is not any post create by this id ${postId}`,
      });
    }

    const likePost = await likesModel.findOne({
      userId: req.user._id,
      postid: postId,
    });

    if (likePost) {
      if (likePost.like == true) {
        await likePost.deleteOne();
        return res.send({
          msg: "you have unliked that post",
        });
      }
    } else {
      await likesModel.create({
        like: true,
        userId: req.user._id,
        postid: postId,
      });

      return res.send({
        msg: "you have liked that post successfully",
      });
    }
  } catch (err) {
    console.log("Error form likes routes", err);
    return res.send({
      msg: "post can not like some thing went wrong",
    });
  }
};

module.exports = {
  LikePosts,
};
