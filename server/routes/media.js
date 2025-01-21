const path = require('path')

const db = require('./db')

async function getMedia(req, res) {

  // Verify media ID
  const media = await db.getMedia(req.params?.mediaID)
  if (!media) {
    return res.status(404).json({ error: "Media not found" })
  }

  // friendsOnly check (thought only)
  const thought = await db.getThought({ id: media.thoughtID })
  const isFriend = req.user.friends.includes(media.username)
  if (!isFriend && thought?.friendsOnly) {
    return res.status(404).json({ error: "Media not found" })
  }

  // Serve media
  res.setHeader("Content-Disposition", `attachment; filename="${media.filename}"`)
  res.sendFile(path.join("data", media.username, "media", media.id), (error) => {
    if (error) {
      res.status(500).json({ error: "Error serving media" })
    }
  })
}

async function uploadMedia(req, res) {

  // Verify thought or forumPost
  const thought = await db.getThought({ id: req.params?.thoughtID })
  const forumPost = await db.getForumPost({ id: req.params?.forumPostID })
  if (!(thought || forumPost)) {
    return res.status(404).json({ error: "Thought or forum post does not exist" })
  }

  // Create media
  let ids = {}
  for (const file of req.files) {
    id = await db.createMedia(req.user.username, file.originalname, thought?.id, forumPost?.id, file.buffer)
    ids[file.originalname] = id
  }

  return res.status(200).json(ids)
}

module.exports = {
  getMedia,
  uploadMedia,
}