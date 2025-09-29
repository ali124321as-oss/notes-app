const { Schema, model, default: mongoose } = require("mongoose");

const notesSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    noteid: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
    ref:{
          type:Schema.Types.ObjectId,
             ref:"user"
    }
  },

  { timestamps: true }
);

const notesModel = model("note", notesSchema);

module.exports = notesModel;
