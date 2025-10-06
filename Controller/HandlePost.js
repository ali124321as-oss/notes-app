const { v4 } = require("uuid");
const {deleteExtraFiles}=require("../expressValidator/deleteExtraFile")
const fs = require("fs");
const path = require("path");
const UserModel = require("../models/userModel");
const postsModel = require("../models/PostsModel");
const { title } = require("process");
const commentsModel = require("../models/CommentsModel");
const likesModel = require("../models/likesModel");
const { asyncWrapProviders } = require("async_hooks");

const createpost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const PostImageUrl = `/postsImages/${req.file.filename}`;

    const PostToken = v4().replace(/-/g, "").slice(0, 10);
    const createPosts = await postsModel.create({
      userId: req.user._id,
      title: title,
      postId: PostToken,
      content: content,
      postimage: PostImageUrl,
    });

    if (!createPosts) {
      return res.send({
        msg: "post can not be created",
      });
    }

    return res.send({
      msg: "post created successfully",
    });
  } catch (error) {
    console.log(error);

    return res.send({
      msg: "some thing went wrong  post can not be created",
    });
  }
};

const getallPosts = async (req, res) => {
  const getallPosts = await postsModel.find({}).sort({ createdAt: -1 });
  if (getallPosts.length == 0) {
    return res.send({
      msg: " posts are not  created yet by anyone",
      totalPosts: getallPosts.length,
      allPosts: getallPosts,
    });
  }

  return res.send({
    msg: "Here is all posts",
    totalPosts: getallPosts.length,
    allPosts: getallPosts,
  });
};

const updateUserPosts = async (req, res) => {
  const postId = req.params.id;

  try {
    const findPost = await postsModel.findOne({
      postId: postId,
      userId: req.user._id,
    });

    if (!findPost) {
      return res.send({ msg: "You cannot update this post" });
    }

    if (req.file && req.file.filename) {
      if (findPost.postimage) {
        const fileDestination = path.join(
          __dirname,
          "public/postImages",
          path.basename(findPost.postimage)
        );
        if (fs.existsSync(fileDestination)) {
          fs.unlinkSync(fileDestination);
          console.log("Old image deleted successfully");
        }
      }
      findPost.postimage = `/images/${req.file.filename}`;
    }

    if (req.body.title && req.body.title.trim() !== "") {
      findPost.title = req.body.title.trim();
    }
    if (req.body.content && req.body.content.trim() !== "") {
      findPost.content = req.body.content.trim();
    }

    await findPost.save();

    return res.send({
      msg: "Post updated successfully",
      postTitle: findPost.title,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).send({ msg: error.message });
    }
    return res.status(400).send({
      msg: "Something went wrong, your post cannot be updated",
    });
  }
};

const deletePosts = async (req, res) => {
  try {
    const postId = req.params.id;
    if (postId) {
      return res.send({
        msg: "please your post id",
      });
    }
    const findPostTODelete = await postsModel.findOne({
      postId: postId,
      userId: req.user._id,
    });

    if (!findPostTODelete) {
      return res.send({
        msg: "please enter valid post id",
      });
    }
    const deleteCommentOfthatPost = await commentsModel.deleteMany({
      postid: findPostTODelete.postId,
    });
    const deleteLikesOFthatPost = await likesModel.deleteMany({
      postid: findPostTODelete.postId,
    });

        const  fileDestination=path.join(__dirname,"/public/postImages",path.basename(findPostTODelete.postimage))
           deleteExtraFiles(fileDestination)
    const result = await findPostTODelete.deleteOne();
    if (result.deletedCount == 1) {
      return res.send({
        msg: "post deleted successfully",
        title: findPostTODelete.title,
        totalCommentsDeletedOfThatPost: deleteCommentOfthatPost.deletedCount,
        totalLikesDeletedOfThatPost: deleteLikesOFthatPost.deletedCount,
      });
    }
  } catch (err) {
    return res.send({
      msg: "some thing went wrong post cannot be deleted ",
    });
  }
};
  
const getSinglePost = async (req, res) => {
  try {
     if (!req.params.postId) {
      return res.send({ msg: "please enter your post id" });
    }
    const postId = req.params.postId;
    

    const findPost = await postsModel.findOne({ postId:postId });
       console.log("find single post",findPost);
       
    if (!findPost) {
      return res.send({ msg: "please enter valid post id" });
    }      

    const findComments = await commentsModel.find({ postid: findPost.postId });
    const findLikes = await likesModel.find({ postid: findPost.postId });

    // comments with writtenBy name
    const commentsWithUser = await Promise.all(
      findComments.map(async (item) => {
        const user = await UserModel.findOne({ _id: item.userId }); // only fullName
        return {
          comment: item.comment,
          writtenBy: user ? user.fullName : null,
        };
      })
    );

    // likes with user fullName
    const likesWithUser = await Promise.all(
      findLikes.map(async (item) => {
        const user = await UserModel.findOne({ _id: item.userId }); // only fullName
        return {
          likedBy: user ? user.fullName : null,
        };
      })
    );

    const findWriterOfPost = await UserModel.findOne({ _id: findPost.userId });

    const allData = {
      post: {
        title: findPost.title,
        content: findPost.content,
        postImageUrl: findPost.postimage,
        writtenBy: findWriterOfPost.fullName,
      },
      allCommentsAndLikesData: {
        totalComments: findComments.length,
        comments: commentsWithUser,
        totalLikes: findLikes.length,
        likedBy: likesWithUser,
      },
    };

    return res.send(allData);
  } catch (error) {
    console.log("Error:", error);
    return res.send({ msg: "post could not be found" });
  }
};

const getAllpostsData = async (req, res) => {
  try {
    const findAllPosts = await postsModel.find({});
    if (findAllPosts.length === 0) {
      return res.send({
        msg: "you have not published any post yet",
        posts: [],
      });
    }

    const allposts = await Promise.all(
      findAllPosts.map(async (post) => {
        const findWriter = await UserModel.findOne(
          { _id: post.userId },
          "fullName"
        );

        const findComments = await commentsModel.find({ postid: post.postId });
        const findLikes = await likesModel.find({ postid: post.postId });

        const commentsWithUser = await Promise.all(
          findComments.map(async (item) => {
            const user = await UserModel.findOne(
              { _id: item.userId },
              "fullName"
            );
            return {
              comment: item.comment,
              writtenBy: user ? user.fullName : null,
            };
          })
        );

        const likesWithUser = await Promise.all(
          findLikes.map(async (item) => {
            const user = await UserModel.findOne(
              { _id: item.userId },
              "fullName"
            );
            return {
              likedBy: user ? user.fullName : null,
            };
          })
        );

        return {
          post: {
            title: post.title,
            content: post.content,
            writtenBy: findWriter ? findWriter.fullName : null,
            allCommentsAndLikesData: {
              totalComments: findComments.length,
              comments: commentsWithUser,
              totalLikes: findLikes.length,
              likedBy: likesWithUser,
            },
          },
        };
      })
    );

    return res.send({
      totalPosts: findAllPosts.length,
      allfeedData: allposts,
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).send({ msg: "Something went wrong" });
  }
};

module.exports = {
  createpost,
  getallPosts,
  updateUserPosts,
  deletePosts,
  getSinglePost,
  getAllpostsData
};
