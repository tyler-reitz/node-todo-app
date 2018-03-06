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
    text: 'Second test todo'
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