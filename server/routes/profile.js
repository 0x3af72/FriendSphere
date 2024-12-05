const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const db = require('./db')

async function getPfp(req, res) {

  // Check if the requested user exists
  username = req.params?.username
  userExists = await db.getExistingUser({ username })
  if (!userExists) {
    return res.status(404).json({ error: "User does not exist" })
  }

  res.sendFile(path.join(process.cwd(), "data", username, "profile/pfp.png"), (error) => {
    if (error) {
      console.error("Error returning profile picture:", error)
      res.status(500).json({ error: "Error returning profile picture" })
    }
  })
}

async function getHTML(req, res) {

  // Check if the requested user exists
  username = req.params?.username
  userExists = await db.getExistingUser({ username })
  if (!userExists) {
    return res.status(404).json({ error: "User does not exist" })
  }

  res.sendFile(path.join(process.cwd(), "data", username, "profile/index.html"), (error) => {
    if (error) {
      console.error("Error returning HTML:", error)
      res.status(500).json({ error: "Error returning HTML" })
    }
  })
}


async function getCSS(req, res) {

  // Check if the requested user exists
  username = req.params?.username
  userExists = await db.getExistingUser({ username })
  if (!userExists) {
    return res.status(404).json({ error: "User does not exist" })
  }

  res.sendFile(path.join(process.cwd(), "data", username, "profile/style.css"), (error) => {
    if (error) {
      console.error("Error returning CSS:", error)
      res.status(500).json({ error: "Error returning CSS" })
    }
  })
}


async function updatePfp(req, res) {

  // Check if file exists
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" })
  }

  try {
    
    // Convert to PNG, write to file
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

  try {

    // Write to file
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

  try {

    // Write to file
    await fs.promises.writeFile(path.join("data", req.username, "profile/style.css"), req.body?.css)
    return res.status(200).json({ success: "CSS updated successfully" })

  } catch (error) {
    console.error("Error updating CSS:", error)
    res.status(500).json({ error: "Error updating CSS" })
  }
}

module.exports = {
  getPfp,
  getHTML,
  getCSS,
  updatePfp,
  updateHTML,
  updateCSS,
}