const { Users } = require('../models/users')

const authenticate = (req, res, next) => {
  const token = req.header('x-auth')

  Users.findByToken(token)
    .then(user => {
      if (!user) {
        Promise.reject()
      }

      req.user = user
      req.token = token
      next()
    })
    .catch(e => res.status(401).send())
}

module.exports = {
  authenticate
}