const mongoose = require('mongoose')

const Users = mongoose.model('Users', {
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
})

module.exports = {
  Users
}