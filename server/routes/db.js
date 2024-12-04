const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("Connected to MongoDB")
}).catch((error) => {
  console.error("Error connecting to MongoDB:", error)
  process.exit(1)
})

// ======================== AUTH ========================

// User collection
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})
const User = mongoose.model("User", userSchema)

// Get existing user by username
async function getExistingUser({ username, email }) {
  return await User.findOne({
    $or: [{ username: username }, { email: email }],
  })
}

// Create user
async function createUser(username, email, password) {
  try {
  
    // Check if user already exists
    const user = await getExistingUser({ username })
    if (user) return false

    // Create the user
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
        username: username,
        email: email,
        password: hashedPassword,
    })
    await newUser.save()
    return true

  } catch (error) {
    console.error("Error creating user:", error)
    return false
  }
}

// Verify user credentials
async function verifyUser(username, password) {
  try {

    // Get existing user
    const user = await getExistingUser(username)
    if (!user) return false

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return false

    return true

  } catch (error) {
    console.error("Error creating user:", error)
    return false
  }
}

// ======================== PROFILE ========================

// Profile collection
const profileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  pfp: String, // Filename
  bio: String,
  hobbies: String, // JSON
  music: String, // JSON
  html: String, // Filename
  css: String, // Filename
})
const Profile = mongoose.model("Profile", profileSchema)

// Get existing profile by username
async function getExistingProfile(username) {
  return await Profile.findOne({ username: username })
}

// Create profile
async function createProfile(username) {
  try {
  
    // Check if user already exists
    const profile = await getExistingProfile(username)
    if (profile) return false

    // Create needed files
    const profileData = path.join("data", username, "profile");
    if (!fs.existsSync()) {
        fs.mkdirSync(profileData, { recursive: true })
    }
    const pfpFile = path.join(profileData, "pfp.png")
    const htmlFile = path.join(profileData, "index.html")
    const cssFile = path.join(profileData, "style.css")
    fs.copyFile("templates/profile/pfp.png", pfpFile, (err) => { err && console.error("Error writing file:", err) })
    fs.copyFile("templates/profile/index.html", htmlFile, (err) => { err && console.error("Error writing file:", err) })
    fs.copyFile("templates/profile/style.css", cssFile, (err) => { err && console.error("Error writing file:", err) })

    // Create the user
    const newProfile = new Profile({
        username: username,
        pfp: pfpFile,
        bio: "",
        hobbies: "[]",
        music: "[]",
        html: htmlFile,
        css: cssFile,

    })
    await newProfile.save()
    return true

  } catch (error) {
    console.error("Error creating user:", error)
    return false
  }
}

// ======================================================

module.exports = {
  getExistingUser,
  createUser,
  verifyUser,
  getExistingProfile,
  createProfile,
}