const express = require('express')
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb')

const { mongoose } = require('../db/mongoose')
const { Users } = require('../models/users')
const { Todos } = require('../models/todos')

const app = express()
const PORT = process.env.PORT || 3000

app.use(bodyParser.json())

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.post('/todos', (req, res) => {
  const todo = new Todos({
    text: req.body.text
  })

  todo.save()
    .then(doc => res.send(doc))
    .catch(e => res.status(400).send(e))
})

app.get('/todos', (req, res) => {
  Todos.find({})
    .then(todos => res.send({ todos }))
    .catch(e => res.status(400).send(e))
})

app.get('/todos/:id', (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id)) {
    return res.status(400).send()
  }

  Todos
    .findById(id)
    .then(todo => {
      if (!todo) return res.status(400).send()
      res.send({ todo })
    })
    .catch(e => res.status(400).send({}))
})

app.listen(PORT, () => console.log(`Started on ${PORT}`))

module.exports = {
  app
}