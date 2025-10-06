const { Schema, model } = require("mongoose");

const commentsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId, // jis user ne likha
    ref: "user",
  },
  userId: {
    type: String,
    required: true,
  },
    postid:{
           type:String,
           required:true
    },
  comment: {
    type: String,
 
  },
    createdAt:{
             type:String,
            
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

    const commentsModel=  model("comment", commentsSchema);
  module.exports = commentsModel;