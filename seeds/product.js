const mongoose = require('mongoose')
const Product = require('../app/models/product')
require('dotenv').config()
mongoose.Promise = global.Promise

mongoose.connect(process.env.DATABASE, { useMongoClient: true });

const products = [
  {
    name: 'Macbook Pro',
    price: 30000,
    oldPrice: 35000
  },
  {
    name: 'Auriculares Sony',
    price: 2500,
    oldPrice: 2650
  },
  {
    name: 'Tablet Xperia',
    price: 5400,
    oldPrice: 6000
  }
]

async function create() {
  await Product.remove({})
  for (const product of products) {
    await Product.create(product)
  }
}

create().then(() => {
  //eslint-disable-next-line no-console
  console.info('[Products] - Seed completed')
  mongoose.disconnect()
})
