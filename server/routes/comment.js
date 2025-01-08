const db = require('./db')

// Within a request context, check if requested user exists
async function reqCommentExists(req, res, next) {
  req.reqComment = await db.getComment(req.params?.commentID)
  if (!req.reqComment) {
    return res.status(404).json({ error: "Comment does not exist" })
  }
  next()
}

async function getComment(req, res) {
  return req.reqComment // TODO: format it
}

async function getComments(req, res) {

  // Friends only check
  const otherUser = (
    await db.getUser({ username: req.reqThought?.username }) ||
    await db.findUser({ username: req.reqForumPost?.username }))
  if (
    (req.reqThought?.friendsOnly && !otherUser.friends.contains(req.username)) ||
    (req.reqForumPost?.friendsOnly && !otherUser.friends.contains(req.username))
  ) {
    return res.status(401).json({ error: "You are not this user's friend" })
  }

  return await db.getComments({ thoughtID: req.reqThought?.id, forumPostID: req.reqForumPost?.id })
}

function createComment(req, res) {
  
}

function deleteComment(req, res) {

}

module.exports = {
  reqCommentExists,
  getComment,
  getComments,
  createComment,
  deleteComment,
}