const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect(
  process.env.MONGO_URI || 'mongodb://localhost:27017/TodoApp',
  { useMongoClient: true }
)

module.exports = {
  mongoose
}