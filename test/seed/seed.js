const { ObjectID } = require('mongodb')
const jwt = require('jsonwebtoken')

const { Todos } = require('../../models/todos')
const { Users } = require('../../models/users')

const userOneId = new ObjectID()
const userTwoId = new ObjectID()
const users = [{
  _id: userOneId,
  email: 'tdreitz@gmail.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId, access: 'auth' }, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'tdreitz+1@gmail.com',
  password: 'userOnePass',
}]

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo'
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
  }
]

const populateTodos = done => {
  Todos.remove({})
    .then(() => Todos.insertMany(todos))
    .then(() => done())
}

const populateUsers = done => {
  Users.remove({})
    .then(() => {
      const userOne = new Users(users[0]).save()
      const userTwo = new Users(users[1]).save()

      return Promise.all([userOne, userTwo])
    })
    .then(() => done())
}

module.exports = { todos, populateTodos, users, populateUsers }