const { Schema, model } = require("mongoose");

const notesSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    notes: [
      {
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
      },
    ],
  },
  { timestamps: true }
);

const notesModel = model("note", notesSchema);

module.exports=notesModel
