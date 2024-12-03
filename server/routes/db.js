const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Connected to MongoDB")
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error)
})

// ======================== AUTH ========================

// User collection
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
})
const User = mongoose.model("User", userSchema)

// Get existing user by username
async function getExistingUser(username) {
    return await User.findOne({ username: username })
}

// Create user
async function createUser(username, email, password) {
    
    // Check if user already exists
    const user = await getExistingUser(username)
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
}

// Verify user credentials
async function verifyUser(username, password) {

    // Get existing user
    const user = await getExistingUser(username)
    if (!user) return false

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return false

    return true
}

// ======================== PROFILE ========================

// Profile collection
const profileSchema = new mongoose.Schema({
    username: String,
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
    fs.copyFile("templates/profile/pfp.png", pfpFile)
    fs.copyFile("templates/profile/index.html", pfpFile)
    fs.copyFile("templates/profile/style.css", pfpFile)

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
}

// ======================================================

module.exports = {
    getExistingUser,
    createUser,
    verifyUser,
    getExistingProfile,
    createProfile,
}