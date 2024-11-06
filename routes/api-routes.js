const express = require("express")
const pool = require("../config/database-config")

const router = express.Router()

// Get all users
router.get("/users", async (req, res) => {
  try {
    const query = "SELECT id, name, email FROM users"
    const result = await pool.query(query)

    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching users", error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// Delete User POST
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params

  try {
    const query = "DELETE FROM users WHERE id = $1"
    const result = await pool.query(query, [id])

    if (result.rowCount > 0) {
      res.status(200).json({ message: "User deleted successfully" })
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ error: "Failed to delete user" })
  }
})

module.exports = router
