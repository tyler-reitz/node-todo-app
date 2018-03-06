const express = require('express')
const bodyParser = require('body-parser')

const { mongoose } = require('./db/mongoose')
const { Users } = require('./models/users')
const { Todos } = require('./models/todos')

const app = express()

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  const todo = new Todos({
    text: req.body.text
  })

  todo.save()
    .then(doc => res.send(doc))
    .catch(e => res.status(400).send(e))
})

app.listen(3000, () => console.log('Started on 3000'))