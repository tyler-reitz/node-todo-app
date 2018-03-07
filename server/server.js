require('../config')

const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb')

const { mongoose } = require('../db/mongoose')
const { Users } = require('../models/users')
const { Todos } = require('../models/todos')

const { authenticate } = require('../middleware/authenticate')

const userRoutes = require('../routes/users')

const app = express()
const PORT = process.env.PORT

app.use(bodyParser.json())

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.post('/todos', authenticate, (req, res) => {
  const todo = new Todos({
    text: req.body.text,
    _creator: req.user._id
  })

  todo.save()
    .then(doc => res.send(doc))
    .catch(e => res.status(400).send(e))
})

app.get('/todos', authenticate, (req, res) => {
  Todos.find({
    _creator: req.user._id
  })
    .then(todos => res.send({ todos }))
    .catch(e => res.status(400).send(e))
})

app.get('/todos/:id', authenticate, (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id)) {
    return res.status(400).send()
  }

  Todos
    .findById({
      _id: id,
      _creator: req.user._id
    })
    .then(todo => {
      if (!todo) return res.status(400).send()
      res.send({ todo })
    })
    .catch(e => res.status(400).send({}))
})

app.delete('/todos/:id', authenticate, (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id)) {
    return res.status(400).send()
  }

  Todos
    .findOneAndRemove({
      _id: id,
      _creator: req.user._id
    })
    .then(todo => {
      if (!todo) {
        return res.status(400).send()
      }
      res.send({ todo })
    })
    .catch(e => res.status(400).send())
})

app.patch('/todos/:id', authenticate, (req, res) => {
  const { id } = req.params
  let { text, completed } = req.body
  let completedAt

  if (!ObjectID.isValid(id)) {
    return res.status(400).send()
  }

  if (_.isBoolean(completed) && completed) {
    completedAt = new Date().getTime()
  } else {
    completed = false
    completedAt = null
  }

  Todos
    .findOneAndUpdate(
      { _id: id, _creator: req.user._id },
      { $set: { text, completed, completedAt } },
      { new: true }
    )
    .then(todo => {
      if (!todo) return res.status(400).send()
      res.send({ todo })
    })
    .catch(e => res.status(400).send())
})

// POST users
app.use('/users', userRoutes)

app.listen(PORT, () => console.log(`Started on ${PORT}`))

module.exports = {
  app
}