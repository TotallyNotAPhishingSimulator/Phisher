require("dotenv").config()
const express = require("express")
const axios = require("axios")
const transporter = require("../../config/email-config")
const emailTemplateJobProposition = require("../../templates/job-proposition/job-proposition")
const emailTemplatePassword = require("../../templates/password/password")
const router = express.Router()
const pool = require("../../config/database-config")

router.post("/", async (req, res) => {
  const { emails, template } = req.body

  if (!emails || emails.length < 1) {
    return res.status(400).json({ message: "No users selected" })
  }

  try {
    // Fetch Users
    const response = await axios.post(
      `${process.env.HOST || `http://localhost:${process.env.PORT}`}/api/users/get`,
      { emails: emails }
    )
    const users = response.data

    // If Users
    if (users.length === 0) {
      return res.send("No users to send emails to.")
    }

    // Create Emails
    const errors = []
    const emailPromises = users.map(async (user) => {
      let mailOptions

      switch (template) {
        case "Job Proposition":
          mailOptions = {
            from: process.env.SMTP_USER,
            to: user.email,
            subject: "Nous avons trouvé de nouvelles propositions pour vous",
            html: emailTemplateJobProposition(user),
          }
          break
        case "Password Reset":
          mailOptions = {
            from: process.env.SMTP_USER,
            to: user.email,
            subject: "Changez le mot de passe de votre compte SNCF",
            html: emailTemplatePassword(user),
          }
          break
        default:
          errors.push(`Template not found for ${template}`)
          break
      }

      // Send Emails
      try {
        await transporter.sendMail(mailOptions)

        emailQuery = `INSERT INTO EMAILS (user_id, template) VALUES ($1, $2)`
        await pool.query(emailQuery, [user.id, template])

        console.log(`Email sent to ${user.email}`)
      } catch (error) {
        console.error(`Error sending email to ${user.email}:`, error)
        errors.push(`Error sending email to ${user.email}: ${error.message}`)
      }
    })

    // After all Emails sent => Show which failed
    await Promise.all(emailPromises)

    if (errors.length > 0) {
      res.status(500).send(`Some emails failed to send. Errors: ${errors.join(", ")}`)
    } else {
      res.send(`${users.length} Emails sent to users!`)
    }
  } catch (error) {
    console.error("Error fetching users or sending emails:", error)
    res.status(500).send("An error occurred while sending emails.")
  }
})

module.exports = router
