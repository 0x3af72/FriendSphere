const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const db = require('./db')

async function getProfile(req, res) {
  const user = await db.getUser(req.params?.username)
  const profile = await db.getProfile(req.params?.username)
  return res.status(200).json({
    bio: profile.bio, hobbies: profile.hobbies, music: profile.music,
    friends: user.friends.length(), subscriptions: user.subscriptions
  })
}

async function getPfp(req, res) {
  res.sendFile(path.join(process.cwd(), "data", req.params?.username, "profile/pfp.png"), (error) => {
    if (error) {
      console.error("Error returning profile picture:", error)
      res.status(500).json({ error: "Error returning profile picture" })
    }
  })
}

async function getHTML(req, res) {
  res.sendFile(path.join(process.cwd(), "data", req.params?.username, "profile/index.html"), (error) => {
    if (error) {
      console.error("Error returning HTML:", error)
      res.status(500).json({ error: "Error returning HTML" })
    }
  })
}

async function getCSS(req, res) {
  res.sendFile(path.join(process.cwd(), "data", req.params?.username, "profile/style.css"), (error) => {
    if (error) {
      console.error("Error returning CSS:", error)
      res.status(500).json({ error: "Error returning CSS" })
    }
  })
}

async function updateProfile(req, res) {

  // Check for required fields
  if (!req.body?.bio || !req.body?.hobbies || !req.body?.music) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  if (await db.updateProfile(req.username, req.body?.bio, req.body?.hobbies, req.body?.music)) {
    return res.status(200).json({ success: "Profile updated successfully" })
  } else {
    return res.status(500).json({ error: "Error updating profile" })
  }
}

async function updatePfp(req, res) {

  // Check if file exists
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" })
  }

  // Convert to PNG, write to file
  try {
    const imageBuffer = await sharp(req.file.buffer).png().toBuffer()
    await fs.promises.writeFile(path.join("data", req.username, "profile/pfp.png"), imageBuffer)
    return res.status(200).json({ success: "Profile picture updated successfully" })
  } catch (error) {
    console.error("Error updating profile picture:", error)
    res.status(500).json({ error: "Error processing image" })
  }
}

async function updateHTML(req, res) {

  // Check if HTML exists
  if (!req.body?.html) {
    return res.status(400).json({ error: "No HTML provided" })
  }

  // Write to file
  try {
    await fs.promises.writeFile(path.join("data", req.username, "profile/index.html"), req.body?.html)
    return res.status(200).json({ success: "HTML updated successfully" })
  } catch (error) {
    console.error("Error updating HTML:", error)
    res.status(500).json({ error: "Error updating HTML" })
  }
}

async function updateCSS(req, res) {

  // Check if CSS exists
  if (!req.body?.css) {
    return res.status(400).json({ error: "No CSS provided" })
  }

  // Write to file
  try {
    await fs.promises.writeFile(path.join("data", req.username, "profile/style.css"), req.body?.css)
    return res.status(200).json({ success: "CSS updated successfully" })
  } catch (error) {
    console.error("Error updating CSS:", error)
    res.status(500).json({ error: "Error updating CSS" })
  }
}

module.exports = {
  getProfile,
  getPfp,
  getHTML,
  getCSS,
  updateProfile,
  updatePfp,
  updateHTML,
  updateCSS,
}