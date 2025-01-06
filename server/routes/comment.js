const db = require('./db')

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
  getComments,
  createComment,
  deleteComment,
}