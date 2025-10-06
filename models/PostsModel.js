const { Schema, model } = require("mongoose");

const postsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId, // jis user ne likha
    ref: "user",
  },
  userId: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
    unique: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  postimage:{
    type:String,
    required:true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

    const postsModel=  model("post", postsSchema);
  module.exports = postsModel;