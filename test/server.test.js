const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('../server/server')
const { Todos } = require('../models/todos')

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

beforeEach(done => {
  Todos.remove({})
    .then(() => Todos.insertMany(todos))
    .then(() => done())
})

describe('POST /todos', () => {
  it('should respond 200', (done) => {
    const text = 'Test todo text'
    
    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text)
      })
      // .end(done)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todos.find({ text })
          .then((todos) => {
            expect(todos.length).toBe(1)
            expect(todos[0].text).toBe(text)
            done()
          })
          .catch(e => done(e))
      })
  })

  it('should not create a todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todos.find()
          .then(todos => {
            expect(todos.length).toBe(2)
            done()
          })
          .catch(e => done(e))
      })
  })
})

describe('GET /todos', () => {
  it('should return all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2)
      })
      .end(done)
  })
})

describe('GET /todos/id', () => {
  it('should return the correct todo doc', (done) => { 
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done)
  })

  it('should return 400 if todo not found', (done) => {
    // expect 400 back for /todos/(objectId-does-not-exist)
    const wrongId = new ObjectID().toHexString()
    
    request(app)
      .get(`/todos/${wrongId}`)
      .expect(400)
      .end(done)
  })

  it('should return 400 for non-object ids', (done) => { 
    request(app)
      .get('/todos/123')
      .expect(400)
      .end(done)
  })
})

describe('DELETE /todos/id', () => {
  it('should remove a todo', (done) => {    
    const hexId = todos[1]._id.toHexString()

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        
        Todos
          .findById(hexId)
          .then(todo => {
            console.log(todo)
            expect(todo).toNotExist()
            done()
          })
          .catch(e => done(e))
      })
  })

  it('should respond 404 for a non-extant id', (done) => { 
    const wrongId = new ObjectID().toHexString()

    request(app)
      .delete(`/todos/${wrongId}`)
      .expect(400)
      .end(done)
  })

  it('should respond 404 for an invalid id', (done) => {
    request(app)
      .delete('/todos/123')
      .expect(400)
      .end(done)
  })
})

describe('PATCH /delete/:id', () => {
  it('should update the todo', (done) => {
    // grab id of first item    
    const hexId = todos[0]._id.toHexString()
    const text = 'First test todo updated'

    // update text, set completed true    
    request(app)
      .patch(`/todos/${hexId}`)
      .send({ text, completed: true})
      // 200
      .expect(200)
      // text is changed, completed is true, completedAt is a number
      .end((err, res) => {
        if (err) return done(err)

        Todos
          .findById(hexId)
          .then(todo => {
            expect(todo.text).toBe(text)
            expect(todo.completed).toBe(true)
            expect(todo.completedAt).toBeA('number')
            done()
          })
          .catch(e => done(e))
      })
  })

  it('should clear todo completedAt when todo is not completed', (done) => {
    // grab id of second item
    const hexId = todos[1]._id.toHexString()
    const text = 'Update second test todo'
    // update text, set completed to false
    request(app)
      .patch(`/todos/${hexId}`)
      .send({ text, completed: false })
      // 200
      .expect(200)
      // text is changed, completed is false, completedAt is null
      .end((err, res) => {
        Todos
          .findById(hexId)
          .then(todo => {
            expect(todo.text).toBe(text)
            expect(todo.completed).toBe(false)
            expect(todo.completedAt).toBeNull()
            done()
          })
          .catch(e => done(err))
      })
  })
})

