const db = require('./db')

async function getUpdates(req, res) {
    const updates = db.getUpdates(req.username)
    const updatesJson = updates.map(update => ({
        id: update.id,
        title: update.title,
    }))
    return res.status(200).json(updatesJson)
}

async function getUpdateByID(req, res) {
    const update = db.getUpdate(req.username, req.params?.updateID)
    if (!update) {
        return res.status(404).json({ error: "Update not found" })
    } else {
        return res.status(200).json({ body: update.body, action: update.action, actionData: update.actionData })
    }
}

module.exports = {
    getUpdates,
    getUpdateByID,
}