const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')
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
  friends: { type: [String], required: true },
  subscriptions: { type: [String], required: true },
  settings: { type: Object, required: true },
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
        friends: [],
        subscriptions: [],
        settings: {},
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

// Thought collection
const thoughtSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  friendsOnly: { type: Boolean, required: true },
})
const Thought = mongoose.model("Thought", thoughtSchema)

// Get thought by username or id
async function getThought({ username, id, and }) {
  if (and) return await Thought.findOne({ username: username, id: id })
  return await Thought.findOne({
    $or: [{ username: username }, { id: id }],
  })
}

// Get thoughts by username
async function getThoughts(username) {
  return await Thought.find({ username: username })
}

// Create thought
async function createThought(username, friendsOnly, title, html, css) {
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
      friendsOnly,
    })
    await newThought.save()
    return id

  } catch (error) {
    console.error("Error creating thought:", error)
    return false
  }
}

// Update thought
async function updateThought(username, id, title, friendsOnly) {
  try {
    const thought = await getThought({ username, id })
    thought.title = title
    thought.friendsOnly = friendsOnly
    await thought.save()
    return true
  } catch (error) {
    console.error("Error updating thought:", error)
    return false
  }
}

// Delete thought
async function deleteThought(username, id) {
  try {
    const thought = await getThought({ username, id })
    await thought.deleteOne()
    return true
  } catch (error) {
    console.error("Error deleting thought:", error)
    return false
  }
}

// =========================== UPDATES ===========================

// Update collection
const updateSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  id: { type: String, required: true, index: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  action: { type: String, required: false },
  actionData: { type: Object, required: false },
})
const Update = mongoose.model("Update", updateSchema)

// Get update by username and id
async function getUpdate(username, id) {
  return await Update.findOne({ username: username, id: id })
}

// Get updates by user
async function getUpdates(username) {
  return await Update.find({ username })
}

// Create update
async function createUpdate(username, title, body, action=undefined, actionData=undefined) {
  try {

    // Generate id for update
    let id;
    while (await getUpdate(username, id) || !id) {
      id = uuidv4();
    }

    const newUpdate = new Update({
      username,
      id,
      title,
      body,
      action,
      actionData,
    })
    await newUpdate.save()
    return true

  } catch (error) {
    console.log("Error creating update:", error)
    return false
  }
}

// Delete update
async function deleteUpdate(username, id) {
  try {
    const update = await getUpdate(username, id)
    await update.deleteOne()
    return true
  } catch (error) {
    console.error("Error deleting update:", error)
    return false
  }
}

// =========================== COMMENTS ===========================

// Comment collection
const commentSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  id: { type: String, required: true },
  thoughtID: { type: String, required: false, index: true }, // Either
  forumPostID: { type: String, required: false, index: true }, // Or
  body: { type: String, required: true },
  files: { type: [String], required: false },
})
const Comment = mongoose.model("Comment", commentSchema)

// =========================== REPLIES ===========================

// Reply collection
const replySchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  commentID: { type: String, required: true, index: true },
  body: { type: String, required: true },
})
const Reply = mongoose.model("Reply", replySchema)

// ======================================================

module.exports = {
  getUser,
  createUser,
  verifyUser,
  getProfile,
  createProfile,
  updateProfile,
  getThought,
  getThoughts,
  createThought,
  updateThought,
  deleteThought,
  getUpdate,
  getUpdates,
  createUpdate,
  deleteUpdate,
}