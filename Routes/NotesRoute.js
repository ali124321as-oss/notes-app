const notesModel = require("../models/NotesModel");
const express = require("express");
const Notesrouter = express.Router();
const { v4 } = require("uuid");
const router = require("./UserRoutes");
const UserModel = require("../models/userModel");

Notesrouter.get("/notes", async (req, res) => {
  const getAllNotes = await notesModel.find({});

  if (!getAllNotes) {
    res.send({ msg: "notes not found" });
  }

  res.send({ notes: getAllNotes });
});

Notesrouter.post("/notes", async (req, res) => {
  const { title, note } = req.body;
  const myId = v4();
  const newNote = await notesModel.create({
    noteid: myId,
    title: title,
    note: note,
  });

  console.log("new Note", newNote);

  res.send(`New Note Created:${newNote}`);
});

Notesrouter.get("/notes/:id", async (req, res) => {
  
  const findNoteByid = await notesModel.findOne({ noteid: req.params.id });
  if (!findNoteByid) {
    return res.send({ msg: `notes of this ${noteId} id not found` });
  }

  return res.send({
    title: findNoteByid.title,
    note: findNoteByid.note,
  });
});

Notesrouter.put("/notes/:id", async (req, res) => {
  try {
    const { title,note} = req.body;

    const replacement = {
      noteid: req.params.id,
      title,
      note,
    };

    await notesModel.replaceOne({ noteid: req.params.id }, replacement, {
      runValidators: true,
    });

    res.status(200).json({ message: "Note updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

Notesrouter.delete("/notes/:id", async (req, res) => {
  try {
    const deletedUser = await notesModel.deleteOne({ noteid: req.params.id });
    if (deletedUser.deletedCount === 0) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.send({ msg: "note  deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

Notesrouter.patch("/notes/:id", async (req, res) => {
  const{note}=req.body
  try {
    const updated = await notesModel.findOneAndUpdate({ noteid: req.params.id },{note:note});
              console.log("updated",updated);
              
    res.send({ msg: "note  updated  successfully",noteid:req.params.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = Notesrouter;
