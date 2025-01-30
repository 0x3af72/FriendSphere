const path = require('path')

const db = require('./db')

async function getMedia(req, res) {

  // Verify media ID
  const media = await db.getMedia(req.params?.mediaID)
  if (!media) {
    return res.status(404).json({ error: "Media not found" })
  }

  // friendsOnly check (thought only)
  const thought = await db.getThought(media.thoughtID)
  const isFriend = req.user.friends.includes(media.username)
  if (!isFriend && thought?.friendsOnly) {
    return res.status(404).json({ error: "Media not found" })
  }

  // Serve media
  res.setHeader("Content-Disposition", `attachment; filename="${media.filename}"`)
  res.sendFile(path.join(process.cwd(), "data", media.username, "media", media.id), (error) => {
    if (error) {
      res.status(500).json({ error: "Error serving media" })
    }
  })
}

async function uploadMedia(req, res) {

  // Check that thought or forum post is by self
  if (req.reqThought) {
    if (req.reqThought.username !== req.user.username) {
      return res.status(401).json({ error: "You are not authorized to perform this action" });
    }
  } else if (req.reqForumPost) {
    if (req.reqForumPost.username !== req.user.username) {
      return res.status(401).json({ error: "You are not authorized to perform this action" });
    }
  }

  // Create media
  let ids = {}
  for (const file of req.files) {
    id = await db.createMedia(req.user.username, file.originalname, req.reqThought?.id, req.reqForumPost?.id, file.buffer)
    ids[file.originalname] = id
  }
  return res.status(200).json(ids)
}

module.exports = {
  getMedia,
  uploadMedia,
}