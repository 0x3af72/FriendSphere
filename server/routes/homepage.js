const db = require('./db')
const { getFriends } = require('./friend')

async function getFriendsNetworkByDistance(user, distance) {

  const friendsNetwork = []
  const visited = new Set()
  const queue = [{ user, curDist: 0 }]

  while (queue.length > 0) {
    const { user, curDist } = queue.shift()

    if (curDist >= distance || visited.has(user.username)) continue
    visited.add(user.username)

    for (const friendUsername of user.friends) {
      const friend = await db.getUser({ username: friendUsername })
      if (!visited.has(friend.username)) {
        friendsNetwork.push({ user: friend, distance: curDist + 1 })
        queue.push({ user: friend, curDist: curDist + 1 })
      }
    }
  }

  return friendsNetwork
}

async function generateHomepage(req, res) {
  try {

    // Get friends and friends of friends
    const friendsNetwork = await getFriendsNetworkByDistance(req.user, 3)

    // Get thoughts from friendsNetwork
    const allThoughts = (
      await Promise.all(
        friendsNetwork.map(async ({ user, distance }) => {
          const hasPerms = user.friends.includes(req.user.username) || user.username === req.user.username
          const userThoughts = (await db.getThoughts(user.username))
            .filter(thought => thought.friendsOnly ? hasPerms : true)
          return userThoughts.map(thought => ({ thought, distance }))
        })
      )
    ).flat()

    // Sort by distance, then by date
    allThoughts.sort((a, b) => {
      if (a.distance === b.distance) {
        return b.thought.createdAt - a.thought.createdAt
      }
      return a.distance - b.distance
    })

    // Randomly pick top numThoughts
    const numThoughts = parseInt(req.params?.numThoughts, 10) || 10
    const randomThoughts = allThoughts.slice(0, numThoughts)

    // Shuffle randomly
    for (let i = randomThoughts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomThoughts[i], randomThoughts[j]] = [randomThoughts[j], randomThoughts[i]]
    }

    res.status(200).json(randomThoughts)
  } catch (err) {
    console.error("Error generating homepage:", err)
    res.status(500).json({ error: "Failed to generate homepage" })
  }
}

module.exports = {
  generateHomepage,
}