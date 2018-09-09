const errors = require("../helpers/errors");
const Product = require("../models/product");

class ProductsHandler {
  async getProducts(req, res) {
    const products = await Product.getProducts()
    res.send(products)
  }

  async createProduct(req, res) {
    try {
      res.status(201).send(await Product.create(req.body))
    }
    catch (e) {
      res.status(400).json(errors.newError(errors.errorsEnum.InvalidData));
    }
  }
}

module.exports = new ProductsHandler()
