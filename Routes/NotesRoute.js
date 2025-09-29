const notesModel = require("../models/NotesModel");
const express = require("express");
const Notesrouter = express.Router();
const { v4 } = require("uuid");
   const path=require("path")
const { getNotesOnPagination } = require("./Pagination");


Notesrouter.get("/notes/title", async (req, res) => {
  const { title } = req.query;

  try {
    if (!title) {
      return res.send({ msg: "please enter a title to search" });
    }

    const notes = await notesModel.find({
      userId: req.user._id, // make sure token user is correct
      title: { $regex: title.trim(), $options: "i" },
    });

    console.log("dlddldldldldldl");

    console.log("notes dkfkdkdkdkddk", notes);

    if (!notes) {
      return res.send({ msg: "note not found" });
    }

    return res.send({
      totalNotes: notes.length,
      notes,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

Notesrouter.get("/notes", async (req, res) => {
  const { page, limit } = req.query;
  try {
    if (!page) {
      return res.send({ msg: "please enter page number" });
    }
    if (!limit) {
      return res.send({ msg: "please enter limit of page" });
    }

    const countUserNotes = await notesModel.countDocuments({
      userId: req.user._id,
    });

    if (countUserNotes === 0) {
      return res.send({ msg: "you have not created any note yet" });
    }

    const GetData = await getNotesOnPagination(
      page,
      limit,
      countUserNotes,
      req.user._id
    );
    return res.send(GetData);
  } catch (err) {
    res.status(400).json({ error: `error :${err.message}` });
  }
});
// get one note
Notesrouter.get("/notes/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      return res.send({ msg: "please enter you note id" });
    }
    const getNote = await notesModel.findOne({
      userId: req.user._id,
      noteid: req.params.id,
    });
    if (!getNote) {
      return res.send({ msg: "note not found" });
    }
    return res.send({
      totalNotes: getNote.length,
      notes: getNote,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  Create a new note
Notesrouter.post("/notes", async (req, res) => {
  const { title, note } = req.body;
  const uuid = v4();

  try {
    if (!title) {
      return res.send({ msg: "title is required" });
    }
    if (!note) {
      return res.send({ msg: "note is required" });
    }

    await notesModel.create({
      userId: req.user._id,
      noteid: uuid,
      title,
      note,
       
      
    });

    res.send({
      msg: "new note created",
      title,
      note,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update note (PUT  full update)
Notesrouter.put("/notes/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      return res.send({ msg: "please enter you note id" });
    }
    const { title, note } = req.body;

    const updateFields = {};
    if (title) updateFields.title = title;
    if (note) updateFields.note = note;

    const updatedNote = await notesModel.updateOne(
      { noteid: req.params.id },
      { $set: updateFields }
    );

    if (updatedNote.matchedCount === 0) {
      return res.send({ msg: "Note not found" });
    }

    return res.json({ msg: "Note updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  Delete note
Notesrouter.delete("/notes/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      return res.send({ msg: "please enter you note id" });
    }
    const deleted = await notesModel.deleteOne({ noteid: req.params.id });

    if (deleted.deletedCount === 0) {
      return res.send({ msg: "Note not found" });
    }

    res.json({ msg: "Note deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
//partially update
Notesrouter.patch("/notes/:id", async (req, res) => {
  const { note } = req.body;

  try {
    if (!req.params.id) {
      return res.send({ msg: "please enter you note id" });
    }
    const updated = await notesModel.findOneAndUpdate(
      { noteid: req.params.id },
      { $set: { note } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Note not found" });
    }

    res.json({ msg: "Note updated successfully", noteid: req.params.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = Notesrouter;
