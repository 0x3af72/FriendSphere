const DOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')

const db = require('./routes/db')

// Within a request context, check if requested user exists
async function reqUserExists(req, res, next) {
  req.reqUser = await db.getUser({ username: req.params?.username })
  if (!req.reqUser) {
    return res.status(404).json({ error: "User does not exist" })
  }
  next()
}

// Within a request context, check if requested thought or forum ID exists
async function reqThoughtOrForumPostIDExists(req, res, next) {
  req.reqThought = await db.getThought({ id: (req.params?.thoughtOrForumID || req.params?.thoughtID || req.params?.forumPostID) })
  req.reqForumPost = null
  // let forumPost = ...
  if (!(req.reqThought || req.reqForumPost)) {
    return res.status(404).json({ error: "Thought or forum ID does not exist" })
  }
  next()
}

// Ensure requested user is not yourself
function reqUserNotSelf(req, res, next) {
  if (req.username == req.params?.username) {
    return res.status(401).json({ error: "You cannot perform this action on yourself!" })
  }
  next()
}

module.exports = {
  reqUserExists,
  reqThoughtOrForumPostIDExists,
  reqUserNotSelf,
}