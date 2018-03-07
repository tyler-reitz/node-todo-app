const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('../server/server')
const { Todos } = require('../models/todos')
const { Users } = require('../models/users')
const { todos, populateTodos, users, populateUsers } = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

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

describe('GET /users/me', () => {
  it('should return if user is authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString())
        expect(res.body.email).toBe(users[0].email)
      })
      .end(done)
  })

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({})
      })
      .end(done)
  })
})

describe('POST /users', () => {
  it('should create a user', (done) => {
    const email = "example@example.com"
    const password = "example123"

    request(app)
      .post("/users")
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.header["x-auth"]).toExist()
        expect(res.body._id).toExist()
        expect(res.body.email).toBe(email)
      })
      .end((err) => {
        if (err) {
          return done(err)
        }

        Users.findOne({ email })
          .then(user => {
            expect(user).toExist()
            expect(user.password).toNotBe(password)
            done()
          })
      })
  })

  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'and',
        password: '123'
      })
      .expect(400)
      .end(done)
  })

  it('should not create user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({ 
        email: users[0].email,
        password: 'Password123'
      })
      .expect(400)
      .end(done)
  })
})

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toExist()
      })
      .end((err, res) => {
        if (err) return done

        Users.findById(users[1]._id)
          .then(user => {
            expect(user.tokens[0]).toInclude({
              access: 'auth',
              token: res.headers['x-auth']
            })
            done()
          })
          .catch(e => done(e))
      })
  })

  it("should reject invalid login", (done) => {
    request(app)
      .post("/users/login")
      .send({ email: users[1].email, password: users[1].password + 1 })
      .end(done)
      .expect(400)
      .expect(res => {
        expect(res.headers["x-auth"]).toNotExist()
      })
      .end((err, res) => {
        if (err) return done()

        Users.findById(users[1]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0)
            done()
          })
          .catch(e => done(e))
      })
  })

})