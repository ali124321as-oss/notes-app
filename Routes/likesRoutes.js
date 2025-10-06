      const express = require("express");
    const{LikePosts}=require("../Controller/HandleLikes")
      const  likesRouter = express.Router();
    
    likesRouter.post("/posts/:postId/likes",LikePosts)

    module.exports=likesRouter
    