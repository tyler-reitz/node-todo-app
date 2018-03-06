const expect = require('expect')
const request = require('supertest')

const { app } = require('../server/server')
const { Todos } = require('../models/todos')

describe('GET /ping', () => {
  it('should return status 200', (done) => {
    request(app)
      .get('/ping')
      .expect(200)
      .end(done)
  })
})

describe('POST /todos', () => {
  beforeEach((done) => {
    Todos.remove({}).then(() => done())
  })

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

        Todos.find()
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
            console.log(todos)
            expect(todos.length).toBe(0)
            done()
          })
          .catch(e => done(e))
      })
  })
})