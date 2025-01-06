const path = require('path')
const fs = require('fs')

const db = require('./db')
const util = require('../util')

async function reqThoughtIsBySelf(req, res, next) {
  if (req.reqThought.username != req.username) {
    return res.status(401).json({ error: "You are not authorized to perform this action" })
  }
  next()
}

async function getThoughts(req, res) {
  const thoughts = await db.getThoughts(req.params?.username)
  const otherUser = await db.getUser({ username: req.params?.username })
  const thoughtsJson = thoughts
    .filter(thought => !thought.friendsOnly || otherUser.friends.includes(req.username)) // friendsOnly check
    .map(thought => ({
      id: thought.id,
      title: thought.title,
    }))
  return res.status(200).json(thoughtsJson)
}

async function getThoughtByID(req, res) {

  const thought = await db.getThought({ username: req.params?.username, id: req.params?.thoughtID, and: true })
  const otherUser = await db.getUser({ username: req.params?.username })

  // Check if user passes friendsOnly check
  if (!(req.username == req.params?.username) && thought.friendsOnly && !otherUser.friends.includes(req.username)) {
    return res.status(404).json({ error: "Thought not found" })
  }

  // Read HTML and CSS
  let html, css
  try {
    const thoughtData = path.join("data", req.params?.username, "thought", req.params?.thoughtID)
    html = (await fs.promises.readFile(path.join(thoughtData, "index.html"))).toString()
    css = (await fs.promises.readFile(path.join(thoughtData, "style.css"))).toString()
  } catch (error) {
    console.error("Error while reading thought files:", error)
    return res.status(500).json({ error: "An error occurred while reading thought files" })
  }

  return res.status(200).json({ id: thought.id, title: thought.title, html: html, css: css })
}

function validateThoughtFields(req, res) {
  try {

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

    // Check if friendsOnly is a bool
    if (!(typeof req.body?.friendsOnly == "boolean")) {
      return res.status(400).json({ error: "friendsOnly must be a boolean" })
    }

  } catch (error) {
    return res.status(500).json({ error: "An error occurred while verifying fields" })
  }
}

async function createThought(req, res) {

  // Field validation
  const validateRes = validateThoughtFields(req, res)
  if (validateRes) return validateRes

  // Create thought
  const id = await db.createThought(req.username, req.body?.friendsOnly, req.body?.title, req.body?.html, req.body?.css)
  if (id) {
    return res.status(200).json({ id: id })
  } else {
    return res.status(500).json({ error: "Error creating thought" })
  }
}

async function updateThought(req, res) {

  // Field validation
  const validateRes = validateThoughtFields(req, res)
  if (validateRes) return validateRes

  // Update thought
  if (await db.updateThought(req.username, req.params?.thoughtID, req.body?.title, req.body?.friendsOnly)) {

    // Write HTML and CSS
    const thoughtData = path.join("data", req.username, "thought", req.params?.thoughtID)
    await fs.promises.writeFile(path.join(thoughtData, "index.html"), req.body?.html)
    await fs.promises.writeFile(path.join(thoughtData, "style.css"), req.body?.css)

    return res.status(200).json({ success: "Thought updated successfully" })
  } else {
    return res.status(500).json({ error: "An error occurred while updating thought" })
  }

}

async function deleteThought(req, res) {
  if (!(await db.deleteThought(req.params?.username, req.params?.thoughtID))) {
    return res.status(500).json({ error: "An error occurred while deleting thought" })
  } else {
    return res.status(200).json({ success: "Thought deleted" })
  }
}

module.exports = {
  reqThoughtIsBySelf,
  getThoughts,
  getThoughtByID,
  createThought,
  updateThought,
  deleteThought,
}