const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Connected to MongoDB")
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error)
})

// User collection
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    passsword: String,
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
        password: hashedPassword
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
    console.log(typeof password)
    console.log(user.password) // undef
    console.log(typeof user.password)
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return false

    return true
}

module.exports = {
    getExistingUser,
    createUser,
    verifyUser,
}