      const express = require("express");
const { createComment, updateComment ,deleteComment} = require("../Controller/HandleComments");
      const  commentRouter = express.Router();
          const{validationMiddleware,textValidator}=require("../expressValidator/allValidatons")
        commentRouter.post("/posts/comments/:postId",[textValidator("comment")],validationMiddleware,createComment)
            commentRouter.patch("/posts/:postId/comments/:commentid",[textValidator("updatedComment")],validationMiddleware,updateComment)
          commentRouter.delete("/posts/:postId/comments/:commentid",deleteComment)
              

                  module.exports=commentRouter