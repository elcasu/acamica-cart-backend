const mongoose = require('mongoose')
const Product = require('../app/models/product')
require('dotenv').config()
mongoose.Promise = global.Promise

mongoose.connect(process.env.DATABASE, { useMongoClient: true });

const products = [
  {
    name: 'Macbook Pro',
    pictureUrl: 'https://s3.amazonaws.com/acamica-cart-images/product01.png',
    price: 30000,
    oldPrice: 35000
  },
  {
    name: 'Auriculares Sony',
    pictureUrl: 'https://s3.amazonaws.com/acamica-cart-images/product02.png',
    price: 2500,
    oldPrice: 2650
  },
  {
    name: 'Tablet Xperia',
    pictureUrl: 'https://s3.amazonaws.com/acamica-cart-images/product04.png',
    price: 5400,
    oldPrice: 6000
  },
  {
    name: 'Notebook MSI',
    pictureUrl: 'https://s3.amazonaws.com/acamica-cart-images/product06.png',
    price: 8500,
    oldPrice: 9000
  },
  {
    name: 'Smartphone Samsung',
    pictureUrl: 'https://s3.amazonaws.com/acamica-cart-images/product07.png',
    price: 7500,
    oldPrice: 8000
  },
  {
    name: 'Rekam',
    pictureUrl: 'https://s3.amazonaws.com/acamica-cart-images/product09.png',
    price: 980,
    oldPrice: 990
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
