const db = require('./db')

async function getFriends(req, res) {
  const user = await db.getUser({ username: req.params?.username })
  if (!user.friends.contains(req.username)) {
    return res.status(401).json({ error: "You are not this user's friend!" })
  }
  return res.status(200).json(user.friends)
}

async function addFriend(req, res) {

  // Get user objects
  const user = await db.getUser({ username: req.username })
  const otherUser = await db.getUser({ username: req.params?.username })

  // Check for ingoing friend request
  const updates = await db.getUpdates(req.username)
  for (let update of updates) {
    if (update.action == "FRIEND_REQUEST" && update.actionData.username == req.params?.username) {
      
      // Update DB
      user.friends.push(req.params?.username)
      otherUser.friends.push(req.username)
      await user.save()
      await otherUser.save()

      return res.status(200).json({ success: "Friend request accepted" })
    }
  }

  // Check if outgoing friend request already exists
  const otherUpdates = await db.getUpdates(req.params?.username)
  for (let update of otherUpdates) {
    if (update.action == "FRIEND_REQUEST" && update.actionData.username == req.username) {
      return res.status(401).json({ error: "An outgoing friend request already exists" })
    }
  }

  // Create update
  if (await createUpdate(
    req.params?.username,
    `Friend request from ${req.username}`,
    `${req.username} has sent you a friend request! They have ${user.friends.length()} friends.`,
    "FRIEND_REQUEST",
    { username: req.username }
  )) {
    return res.status(200).json({ success: "Friend request sent" })
  }
  return res.status(500).json({ error: "An error occurred while sending friend request" })
}

async function declineFriend(req, res) {

}

module.exports = {
  getFriends,
  addFriend,
  declineFriend,
}