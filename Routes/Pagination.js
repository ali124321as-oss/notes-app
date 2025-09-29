    const notesModel=require("../models/NotesModel")
async function getNotesOnPagination(page, limit, notesCount, userId) {
  page = parseInt(page);
  limit = parseInt(limit);

  const filteredNotes = await notesModel
    .find({ userId:userId })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  const totalPages = Math.ceil(notesCount / limit);

  return {
    currentPage: page,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null,
    totalNotes: notesCount,
    totalPages,
    totalFilterNotes:filteredNotes.length,
    notes: filteredNotes,
  };
}

module.exports = { getNotesOnPagination };
