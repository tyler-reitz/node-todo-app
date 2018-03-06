const { SHA256 } = require('crypto-js')
const jwt = require('jsonwebtoken')

const data = {
  id: 10
}

const token = jwt.sign(data, '123abc')
console.log(token)

const decoded = jwt.verify(token, '123abc')
console.log('Decoded: ', decoded)

// const message = 'I am sensitive info'
// const hash = SHA256(message).toString()

// console.log(`Message: ${message}`)
// console.log(`Hash: ${hash}`)

// const data = {
//   id: 4
// }

// const token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'some secret').toString(),
// }

// token.data.id = 5
// token.hash = SHA256(JSON.stringify(token.data)).toString()

// const resultHash = SHA256(JSON.stringify(token.data) + 'some secret').toString()
// if (resultHash === token.hash) {
//   console.log('data was not changed')
// } else {
//   console.log('Data was changed')
// }