const Product = require("../models/product");

class ProductsHandler {
  /**
   * @api {get} /api/products Get list of available products
   * @apiName getProducts
   * @apiGroup Products
   * @apiVersion 0.1.0
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    [
   *      {
   *          "_id": "5b9596046b0838f64c0c5012",
   *          "name": "Macbook Pro",
   *          "price": 30000,
   *          "oldPrice": 35000,
   *          "pictureUrl": "https://s3.amazonaws.com/mycart/product1.png"
   *      },
   *      {
   *          "_id": "5b9596046b0838f64c0c5013",
   *          "name": "Auriculares Sony",
   *          "price": 2500,
   *          "oldPrice": 2650,
   *          "pictureUrl": "https://s3.amazonaws.com/mycart/product2.png"
   *      }
   *    ]
   *
   * @apiError InvalidToken Invalid token
   *
   * @apiErrorExample Error-Response
   *    HTTP/1.1 400 Bad Request
   *    {
   *      code: 1000301,
   *      message: "Invalid token.",
   *      detail: {},
   *      errors: ['activation_token']
   *    }
   */
  async getProducts(req, res) {
    const products = await Product.getProducts()
    res.send(products)
  }
}

module.exports = new ProductsHandler()
