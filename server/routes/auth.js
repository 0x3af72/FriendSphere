const jwt = require('jsonwebtoken')

const db = require('./db')

async function register(req, res) {

    // Check username length and validity
    usernameRegex = /^[a-z0-9]+$/i
    if (!usernameRegex.test(req.body?.username)) {
        return res.status(400).json({ error: "Username must be alphanumeric" })
    }
    
    if (!(3 <= req.body?.username?.length && req.body?.username?.length <= 20)) {
        return res.status(400).json({ error: "Username must be between 3 and 20 characters" })
    }

    // Check email length and validity
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(req.body?.email)) {
        return res.status(400).json({ error: "Invalid email format" })
    }
    if (!(5 <= req.body?.email?.length && req.body?.email?.length <= 30)) {
        return res.status(400).json({ error: "Email must be between 5 and 30 characters" })
    }

    // Check password length
    if (!(6 <= req.body?.password?.length)) {
        return res.status(400).json({ error: "Password must be longer than 5 characters" })
    }

    // Create user
    const success = await db.createUser(req.body?.username, req.body?.email, req.body?.password)
    if (success) {

        // Generate JWt token
        const token = jwt.sign({ username: req.user.username }, process.env.JWT_SECRET)
        return res.status(200).json({ token })
        
    } else {
        return res.status(500).json({ error: "Something went wrong" })
    }
}

async function login(req, res) {

    // Verify user
    const success = await db.verifyUser(req.body?.username, req.body?.password)

    // Generate JWT token
    if (success) {
        const token = jwt.sign({ username: req.user.username }, process.env.JWT_SECRET)
        return res.status(200).json({ token })
    }

    else {
        return res.status(400).json({ error: "Invalid credentials" })
    }
}

function authenticate(req, res, next) {

    // Get token
    const token = req.cookies?.token
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" })
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized" })
        }
        req.user = decoded.user
        next()
    })
}

module.exports = {
    register,
    login,
    authenticate,
}