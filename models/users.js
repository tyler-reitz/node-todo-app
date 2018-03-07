const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bycrpt = require('bcryptjs')

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: (v) => {
        return validator.isEmail(v)
      },
      message: 'Not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        requried: true
      }
    }
  ]
})

UserSchema.pre('save', function (next) {
  const user = this

  if (user.isModified('password')) {
    const rawPassword = user.password

    bycrpt.genSalt(10, (err, salt) => {
      bycrpt.hash(rawPassword, salt, (err, hash) => {
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

UserSchema.statics.findByCredentials = function (email, password) {
  const User = this

  return User
    .findOne({ email })
    .then(user => {
      if (!user) {
        return Promise.reject()
      }

      return new Promise((resolve, reject) => {
        bycrpt.compare(password, user.password, (err, res) => {
          if (!res) {
            reject(user)
          }

          resolve(user)
        })
      })
    })
}

UserSchema.statics.findByToken = function(token) {
  const Users = this
  let decoded

  try {
    decoded = jwt.verify(token, "abc123")
  } catch (e) {
    return Promise.reject()
  }

  return Users.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  })
}


UserSchema.methods.toJSON = function () {
  const user = this
  const { _id, email } = user.toObject()

  return { _id, email }
}

UserSchema.methods.generateAuthToken = function () {
  const user = this
  const access = 'auth'
  const token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString()

  user.tokens = user.tokens.concat([{ access, token }])
  
  return user.save()
    .then(() => token)
}

UserSchema.methods.removeToken = function (token) {
  const User = this

  return User.update({ $pull: { tokens: { token } }
  })
}

const Users = mongoose.model('Users', UserSchema)

module.exports = {
  Users
}