const { ObjectID } = require('mongodb')
const { mongoose } = require('../db/mongoose')
const { Todos } = require('../models/todos')

const id = '5a9e104ff014823dad7c427411'

if (!ObjectID.isValid(id)) {
  console.log('Id not valid')
}
// Todos
//   .find({ _id: id })
//   .then(todos => {
//     if (todos.length === 0) {
//       return console.log('Id not found')
//     }
//     console.log('Todos', todos)
//   })
//   .catch(e => console.log(e))

// Todos
//   .findOne({ _id: id })
//   .then(todo => console.log('Todo', todo))
//   .catch(e => console.log(e))

Todos
  .findById(id)
  .then(todo => {
    if (!todo) {
      return console.log('Id not found')
    }
    console.log(todo)
  })
  .catch(e => console.log(e))