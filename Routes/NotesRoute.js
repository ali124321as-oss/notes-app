const notesModel = require("../models/NotesModel");
const express = require("express");
const Notesrouter = express.Router();
const { v4 } = require("uuid");
const router = require("./UserRoutes");
const UserModel = require("../models/userModel");

Notesrouter.get("/notes", async (req, res) => {
  const getAllNotes = await notesModel.findOne({ userId: req.user._id });

  if (!getAllNotes ) {
    return res.send({allYourNotes: [] });
  }
  const Notes = getAllNotes.notes;

  res.send({
    TotalNotes: Notes.length,
    notes: Notes,
  });
});

Notesrouter.post("/notes", async (req, res) => {
  const { title, note } = req.body;
  const uuid = v4();
    try {
        if (!title) {
             return res.send({msg:"title is required"})
     }if (!note) {
                return res.send({msg:"note is required"})
     }
  const userNotes = await notesModel.findOne({ userId: req.user._id });
  const newNote = {
    noteid: uuid,
    title: title,
    note: note,
  };

        
  if (!userNotes) {
    notesModel.create({
      userId: req.user._id,
      notes: [newNote],
    });
  } else {
    userNotes.notes.push(newNote);
    await userNotes.save();
  }

  console.log("new Note", newNote);

  res.send(`New Note Created:`);
    } catch (err) {
           console.log(err);
           
    }
   
});

Notesrouter.put("/notes/:id", async (req, res) => {
  try {
    const { title, note } = req.body;

    const updatedUser = await notesModel.updateOne(
      { userId: req.user._id, "notes.noteid": req.params.id },
      {
        $set: {
          "notes.$.title": title,
          "notes.$.note": note,
        },
      }
    );

    if (updatedUser.matchedCount == 0) {
      return res.send({ msg: "User or note not found" });
    }

    return res.json({ msg: "Note updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

Notesrouter.delete("/notes/:id", async (req, res) => {
  try {
  
    const user = await notesModel.findOne({ userId: req.user._id });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    
    const noteExists = user.notes.some(n => n.noteid === req.params.id);

    if (!noteExists) {
      return res.status(404).json({ msg: "Note not found" });
    }

    
    user.notes = user.notes.filter(n => n.noteid !== req.params.id);
    await user.save();

    res.json({ msg: "Note deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



Notesrouter.patch("/notes/:id", async (req, res) => {
  const { note } = req.body;

  try {
    const updated = await notesModel.findOneAndUpdate(
      { userId: req.user._id, "notes.noteid": req.params.id }, 
      { $set: { "notes.$.note": note } },
   
    );

    if (!updated) {
      return res.status(404).json({ msg: "User or note not found" });
    }

    res.json({ msg: "Note updated successfully", noteid: req.params.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = Notesrouter;
