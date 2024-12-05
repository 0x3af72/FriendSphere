const db = require('./db')
const util = require('../util')

async function getThoughts(req, res) {

}

async function getThoughtByID(req, res) {
  
}

async function createThought(req, res) {
  
  // Check for required fields
  if (!req.body?.title || !req.body?.html || !req.body?.css) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  // Check length of fields
  if (!(1 <= req.body?.title?.length && req.body?.title?.length <= 200)) {
    return res.status(400).json({ error: "Title must be between 1 and 200 characters" })
  }
  if (!(1 <= req.body?.html?.length)) {
    return res.status(400).json({ error: "HTML must be longer than 1 character" })
  }

  // Sanitize HTML
  const html = util.sanitizeHTML(req.body?.html)

  // Create thought
  const id = await db.createThought(req.username, req.body?.title, html, req.body?.css)
  if (id) {
    return res.status(200).json({ id: id })
  } else {
    return res.status(500).json({ error: "Error creating thought" })
  }
}

async function updateThought(req, res) {
  
}

async function deleteThought(req, res) {
  
}

module.exports = {
  getThoughts,
  getThoughtByID,
  createThought,
  updateThought,
  deleteThought,
}