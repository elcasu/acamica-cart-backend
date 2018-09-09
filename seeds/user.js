const mongoose = require('mongoose')
const User = require('../app/models/user')
require('dotenv').config()
mongoose.Promise = global.Promise

mongoose.connect(process.env.DATABASE, { useMongoClient: true });

const user = {
  email: 'pepe@example.com',
  password: '123123123',
  firstname: 'Pepe',
  lastname: 'Argento'
}


async function create() {
  await User.remove({})
  await User.create(user)
}

create().then(() => {
  //eslint-disable-next-line no-console
  console.info('[User] - Seed completed')
  mongoose.disconnect()
})
