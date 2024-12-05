const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("Connected to MongoDB")
}).catch((error) => {
  console.error("Error connecting to MongoDB:", error)
  process.exit(1)
})

// Configure Mongoose
mongoose.Schema.Types.String.checkRequired(v => typeof v === "string");

// ======================== AUTH ========================

// User collection
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})
const User = mongoose.model("User", userSchema)

// Get existing user by username or email
async function getUser({ username, email }) {
  return await User.findOne({
    $or: [{ username: username }, { email: email }],
  })
}

// Create user
async function createUser(username, email, password) {
  try {
  
    // Check if user already exists
    const user = await getUser({ username })
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
    const user = await getUser({ username })
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
  bio: { type: String, required: true},
  hobbies: { type: [String], required: true},
  music: { type: [String], required: true},
})
const Profile = mongoose.model("Profile", profileSchema)

// Get existing profile by username
async function getProfile(username) {
  return await Profile.findOne({ username: username })
}

// Create profile
async function createProfile(username) {
  try {
  
    // Check if user already exists
    const profile = await getProfile(username)
    if (profile) return false

    // Create needed files
    const profileData = path.join("data", username, "profile");
    await fs.promises.mkdir(profileData, { recursive: true })
    await fs.promises.copyFile("templates/profile/pfp.png", path.join(profileData, "pfp.png"))
    await fs.promises.copyFile("templates/profile/index.html", path.join(profileData, "index.html"))
    await fs.promises.copyFile("templates/profile/style.css", path.join(profileData, "style.css"))

    // Create the user
    const newProfile = new Profile({
        username: username,
        bio: "",
        hobbies: [],
        music: [],
    })
    await newProfile.save()
    return true

  } catch (error) {
    console.error("Error creating user:", error)
    return false
  }
}

// Update profile
async function updateProfile(username, bio, hobbies, music) {
  try {
    const profile = await getProfile(username)
    profile.bio = bio
    profile.hobbies = hobbies
    profile.music = music
    await profile.save()
    return true
  } catch (error) {
    console.error("Error updating profile:", error)
    return false
  }
}

// ======================== THOUGHTS ========================

// Thoughts collection
const thoughtSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
})
const Thought = mongoose.model("Thought", thoughtSchema)

// Get thoughts by username or id
async function getThought({ username, id }) {
  return await User.findOne({
    $or: [{ username: username }, { id: id }],
  })
}

// Create thought
async function createThought(username, title, html, css) {
  try {

    // Generate id for thought
    let id;
    while (await getThought({ id }) || !id) {
      id = uuidv4();
    }

    // Write to files
    const thoughtData = path.join("data", username, "thought", id)
    await fs.promises.mkdir(thoughtData, { recursive: true })
    await fs.promises.writeFile(path.join(thoughtData, "index.html"), html)
    await fs.promises.writeFile(path.join(thoughtData, "style.css"), css)

    // Update database
    const newThought = new Thought({
      username: username,
      id: id,
      title: title,
    })
    await newThought.save()
    return id

  } catch (error) {
    console.error("Error creating thought:", error)
    return false
  }
}

// ======================================================

module.exports = {
  getUser,
  createUser,
  verifyUser,
  getProfile,
  createProfile,
  updateProfile,
  getThought,
  createThought,
}