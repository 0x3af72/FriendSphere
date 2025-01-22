const db = require('./db')

// Within a request context, check if requested user exists
async function reqCommentExists(req, res, next) {
  req.reqComment = await db.getComment(req.params?.commentID)
  if (!req.reqComment) {
    return res.status(404).json({ error: "Comment does not exist" })
  }
  req.reqThought = req.reqComment.thoughtID && (await db.getThought(req.reqComment.thoughtID))
  req.reqForumPost = req.reqComment.forumPostID && undefined // TODO
  req.reqUser == (
    (req.reqThought && await db.getUser({ username: req.reqThought.username })) || 
    (req.reqForumPost && await db.getUser({ username: req.reqForumPost.username }))
  )
  next()
}

function reqCommentIsBySelf(req, res, next) {
  if (req.reqComment.username != req.user.username) {
    return res.status(401).json({ error: "You are not authorized to perform this action" })
  }
  next()
}

async function getComment(req, res) {

  // friendsOnly check (thought only)
  if (req.reqThought?.friendsOnly && !(req.user.username == req.reqThought.username) && !(req.reqUser.friends.includes(req.user.username))) {
    return res.status(404).json({ error: "Comment not found" })
  }

  return res.status(200).json(req.reqComment)
}

async function getComments(req, res) {

  // friendsOnly check (thought only)
  if (req.reqThought?.friendsOnly && !(req.user.username == req.reqUser.username) && !req.user.friends.includes(req.reqUser.username)) {
    return res.status(401).json({ error: "You are not this user's friend" })
  }

  let comments = await db.getComments({ thoughtID: req.reqThought?.id, forumPostID: req.reqForumPost?.id })
  return res.status(200).json(comments)
}

async function createComment(req, res) {

  // Check whether comment is a reply
  let replyToCommentID = req.body?.replyToCommentID
  if (replyToCommentID) {
    let replyToComment = await db.getComment(replyToCommentID)
    if (!(replyToComment?.thoughtID == req.reqThought.id || replyToComment?.forumPostID == req.reqForumPost.id)) {
      return res.status(404).json({ error: "Target comment for reply not found" })
    }
  }
  
  // Fields check
  if (!(req.body?.body.length <= 1000)) {
    return res.status(400).json({ error: "Comment body cannot exceed 1000 characters" })
  }

  // Create
  let id = await db.createComment(req.user.username, req.reqThought?.id, req.reqForumPost?.id, req.body?.body)
  return res.status(200).json({ id: id })
}

async function deleteComment(req, res) {
  if (!(await db.deleteComment(req.reqUser.username, req.params?.commentID))) {
    return res.status(500).json({ error: "An error occurred while deleting comment" })
  } else {
    return res.status(200).json({ success: "Comment deleted" })
  }
}

module.exports = {
  reqCommentExists,
  reqCommentIsBySelf,
  getComment,
  getComments,
  createComment,
  deleteComment,
}