const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/authenticate')

const { Users } = require('../models/users')

router.post('/', (req, res) => {
  const { email, password } = req.body
  const user = new Users({ email, password })

  user
    .generateAuthToken()
    .then(token => res.header('x-auth', token).send(user))
    .catch(() => res.status(400).send())
})

router.get('/me', authenticate, (req, res) => {
  res.send(req.user)
})

module.exports = router