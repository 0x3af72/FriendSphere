const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

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
  
}

async function updateCSS(req, res) {
  
}

module.exports = {
  updatePfp,
  updateHTML,
  updateCSS,
}