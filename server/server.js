require('dotenv').config()

const auth = require('./routes/auth')

const express = require('express')
const app = express()
app.use(express.json())

app.get("/api", auth.authenticate, (req, res) => {
    res.json({"users": ["user1", "user2", "user3"]})
})

app.post("/register", auth.register)
app.post("/login", auth.login)

app.listen(5000, () => { console.log("Server started on port 5000") })