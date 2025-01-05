const DOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')

const db = require('./routes/db')

// Within a request context, check if requested user exists
async function reqUserExists(req, res, next) {
  username = req.params?.username
  if (!await db.getUser({ username })) {
    return res.status(404).json({ error: "User does not exist" })
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
  reqUserNotSelf,
}