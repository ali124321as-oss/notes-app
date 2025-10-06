const { Schema, model } = require("mongoose");

const likesSchema = new Schema({
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

  like: {
    type: Boolean,
     default:false
  },
    



});

    const likesModel=  model("like", likesSchema);
  module.exports = likesModel;