const jwt = require("jsonwebtoken");
const errors = require("../helpers/errors");
const User = require("../models/user");

class UsersHandler {
  /**
   * @api {post} /api/users/authenticate Authenticate user
   * @apiName authenticate
   * @apiGroup Users
   * @apiVersion 0.1.0
   *
   * @apiParam {String} email User email
   * @apiParam {String} password User password
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    {
   *      token:  "12345abcdef",
   *      user: {
   *        _id: user._id,
   *        email: "user@example.com",
   *        firstname: "John",
   *        lastname: "Doe"
   *      }
   *    }
   *
   * @apiError LoginInvalidCredentials Invalid credentials
   *
   * @apiErrorExample Authentication error
   *    HTTP/1.1 401 Unauthorized
   *    {
   *      code: 1000100,
   *      message: "Invalid credentials.",
   *      detail: {},
   *      errors: []
   *    }
   *
   *
   * @apiError CantAuthenticateUser There was a problem on authenticate user
   *
   * @apiErrorExample Internal error
   *    HTTP/1.1 500 Internal server error
   *    {
   *      code: 1000101,
   *      message: "There was a problem on authenticate user.",
   *      detail: {},
   *      errors: []
   *    }
   */
  async authenticate(req, res) {
    let user
    try {
      user = await User.findOne({
        email: req.body.email
      }, '+password')
    } catch (e) {
      return res.status(500).json(errors.newError(errors.errorsEnum.CantAuthenticateUser))
    }

    if (!user) {
      return res.status(401).json(errors.newError(errors.errorsEnum.LoginInvalidCredentials));
    }
    let validPassword = user.comparePassword(req.body.password);
    if (!validPassword) {
      return res.status(401).json(errors.newError(errors.errorsEnum.LoginInvalidCredentials));
    }
    let token = jwt.sign({
      _id: user._id,
      email: user.email
    }, process.env.SECRET, {
      expiresIn: 86400
    }); // 86400 seconds = 1 day

    res.json({
      token: token,
      user: user.asJson()
    })
  }

  /**
   * @api {post} /api/users Register new user
   * @apiName user_create
   * @apiGroup Users
   * @apiVersion 0.1.0
   *
   * @apiParam {String} email User email
   * @apiParam {String} password User password
   * @apiParam {String} firstname User firstname
   * @apiParam {String} lastname User lastname
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 201 Created
   *    {
   *      token:  "12345abcdef",
   *      user: {
   *        _id: user._id,
   *        email: "user@example.com",
   *        firstname: "John",
   *        lastname: "Doe"
   *      }
   *    }
   *
   *
   * @apiError CantCreateUser Can't create new user
   *
   * @apiErrorExample Create user error
   *    HTTP/1.1 400 Bad Request
   *    {
   *      code: 1000000,
   *      message: "Can't create new user.",
   *      detail: {},
   *      errors: []
   *    }
   *
   *
   * @apiError UserEmailAlreadyUsed A user with that email already exists
   *
   * @apiErrorExample User aleady exists error
   *    HTTP/1.1 409 Conflict
   *    {
   *      code: 1000001,
   *      message: "A user with that email already exists.",
   *      detail: {},
   *      errors: ['email']
   *    }
   */
  async createUser(req, res) {
    let user = new User()
    user.email = req.body.email
    user.password = req.body.password
    user.firstname = req.body.firstname
    user.lastname = req.body.lastname

    try {
      await user.save()
      res.status(201).json({
        message: "User created!",
        user: user.asJson()
      })
    } catch (err) {
      if (err.code === 11000)
        return res.status(409).json(errors.newError(errors.errorsEnum.UserEmailAlreadyUsed, err, ['email']));
      else
        return res.status(400).json(errors.newError(errors.errorsEnum.CantCreateUser, err));
    }
  }

  /**
   * @api {get} /api/whishlist Get user whishlist
   * @apiName getWhishlist
   * @apiGroup Whishlist
   * @apiVersion 0.1.0
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    [
   *      {
   *          __v: 0,
   *          name: "Notebook MSI",
   *          price: 8500,
   *          oldPrice: 9000,
   *          pictureUrl: "https://s3.amazonaws.com/mycart/product6.png",
   *          _id: "5b9596046b0838f64c0c5015"
   *      },
   *      {
   *          __v: 0,
   *          name: "Smartphone Samsung",
   *          price: 7500,
   *          oldPrice: 8000,
   *          pictureUrl: "https://s3.amazonaws.com/mycart/product7.png",
   *          _id: "5b9596046b0838f64c0c5016"
   *      }
   *    ]
   *
   * @apiError InvalidToken Invalid token
   *
   * @apiErrorExample Authentication error
   *    HTTP/1.1 403 Forbidden
   *    {
   *      code: 1000301,
   *      message: "Invalid token.",
   *      detail: {},
   *      errors: ['activation_token']
   *    }
   */
  async getWhishlist(req, res) {
    const user = req.current_user
    res.send(await user.getWhishlist())
  }

  /**
   * @api {post} /api/whishlist Add product to whishlist
   * @apiName addProductToWhishlist
   * @apiGroup Whishlist
   * @apiVersion 0.1.0
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    [
   *      {
   *          __v: 0,
   *          name: "Notebook MSI",
   *          price: 8500,
   *          oldPrice: 9000,
   *          pictureUrl: "https://s3.amazonaws.com/mycart/product6.png",
   *          _id: "5b9596046b0838f64c0c5015"
   *      },
   *      {
   *          __v: 0,
   *          name: "Smartphone Samsung",
   *          price: 7500,
   *          oldPrice: 8000,
   *          pictureUrl: "https://s3.amazonaws.com/mycart/product7.png",
   *          _id: "5b9596046b0838f64c0c5016"
   *      }
   *    ]
   *
   * @apiError ProductAlreadyExists The product to be added, already exists in your whishlist
   * @apiErrorExample Error - Product already exists
   *    HTTP/1.1 400 Bad Request
   *    {
   *        message: "Product already exists in the whishlist"
   *    }
   *
   * @apiError ProductNotFound The product to be added, does not exist in the database
   * @apiErrorExample Error - Product not found
   *    HTTP/1.1 400 Bad Request
   *    {
   *        message: "The product provided was not found"
   *    }
   *
   * @apiError InvalidToken Invalid token
   *
   * @apiErrorExample Authentication error
   *    HTTP/1.1 403 Forbidden
   *    {
   *      code: 1000301,
   *      message: "Invalid token.",
   *      detail: {},
   *      errors: ['activation_token']
   *    }
   */
  async addProductToWhishlist(req, res) {
    const user = req.current_user;
    try {
      const updatedUser = await user.addProductToWhishlist(req.body.productId);
      res.send(updatedUser.whishlist);
    }
    catch (e) {
      res.status(e.code).send(e.message)
    }
  }

  /**
   * @api {delete} /api/whishlist/:productId Add product to whishlist
   * @apiName removeProductToWhishlist
   * @apiGroup Whishlist
   * @apiVersion 0.1.0
   *
   * @apiParam {String} productId Product ID to be removed from whishlist
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    [
   *      {
   *          __v: 0,
   *          name: "Notebook MSI",
   *          price: 8500,
   *          oldPrice: 9000,
   *          pictureUrl: "https://s3.amazonaws.com/mycart/product6.png",
   *          _id: "5b9596046b0838f64c0c5015"
   *      }
   *    ]
   *
   * @apiError ProductNotFound
   * @apiErrorExample Product not found error
   *    HTTP/1.1 400 Bad Request
   *    {
   *        message: "Product does not exist in your whishlist"
   *    }
   *
   * @apiError InvalidToken Invalid token
   *
   * @apiErrorExample Authentication error
   *    HTTP/1.1 403 Forbidden
   *    {
   *      code: 1000301,
   *      message: "Invalid token.",
   *      detail: {},
   *      errors: ['activation_token']
   *    }
   */
  async removeProductFromWhishlist(req, res) {
    const user = req.current_user
    try {
      const updatedUser = await user.removeProductFromWhishlist(req.params.productId)
      res.send(updatedUser.whishlist)
    }
    catch(e) {
      res.status(e.code).send(e.message)
    }
  }

  /**
   * @api {get} /api/cart Get user cart
   * @apiName getCart
   * @apiGroup Cart
   * @apiVersion 0.1.0
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    [
   *       {
   *           qty: 3,
   *           product: {
   *               pictureUrl: "https://s3.amazonaws.com/mycart/product1.png",
   *               oldPrice: 35000,
   *               price: 30000,
   *               name: "Macbook Pro",
   *               __v: 0,
   *               _id: "5b9596046b0838f64c0c5012"
   *           },
   *           _id: "5b9808ed1e85e9371467034f"
   *       },
   *       {
   *           qty: 1,
   *           product: {
   *               pictureUrl: "https://s3.amazonaws.com/mycart/product6.png",
   *               oldPrice: 9000,
   *               price: 8500,
   *               name: "Notebook MSI",
   *               __v: 0,
   *               _id: "5b9596046b0838f64c0c5015"
   *           },
   *           _id: "5b9808f81e85e93714670351"
   *       }
   *     ]
   *
   * @apiError InvalidToken Invalid token
   *
   * @apiErrorExample Authentication error
   *    HTTP/1.1 403 Forbidden
   *    {
   *      code: 1000301,
   *      message: "Invalid token.",
   *      detail: {},
   *      errors: ['activation_token']
   *    }
   */
  async getCart(req, res) {
    const user = req.current_user
    res.send(await user.getCart())
  }

  /**
   * @api {post} /api/cart Add product to cart
   * @apiName addProductToCart
   * @apiGroup Cart
   * @apiVersion 0.1.0
   *
   * @apiParam {String} productId Product Id to be added to the cart
   * @apiParam {Number} qty Quantity to be added
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    [
   *       {
   *           qty: 3,
   *           product: {
   *               pictureUrl: "https://s3.amazonaws.com/mycart/product1.png",
   *               oldPrice: 35000,
   *               price: 30000,
   *               name: "Macbook Pro",
   *               __v: 0,
   *               _id: "5b9596046b0838f64c0c5012"
   *           },
   *           _id: "5b9808ed1e85e9371467034f"
   *       },
   *       {
   *           qty: 2,
   *           product: {
   *               pictureUrl: "https://s3.amazonaws.com/mycart/product6.png",
   *               oldPrice: 9000,
   *               price: 8500,
   *               name: "Notebook MSI",
   *               __v: 0,
   *               _id: "5b9596046b0838f64c0c5015"
   *           },
   *           _id: "5b9808f81e85e93714670351"
   *       }
   *     ]
   *
   * @apiError ProductNotFound Product ID to be added to cart, not found
   * @apiErrorExample Product not found error
   *    HTTP/1.1 400 Bad Request
   *    {
   *        message: "Product not found"
   *    }
   *    
   *
   * @apiError InvalidToken Invalid token
   *
   * @apiErrorExample Authentication error
   *    HTTP/1.1 403 Forbidden
   *    {
   *      code: 1000301,
   *      message: "Invalid token.",
   *      detail: {},
   *      errors: ['activation_token']
   *    }
   */
  async addProductToCart(req, res) {
    const user = req.current_user
    try {
      const updatedUser = await user.addProductToCart(req.body.productId, req.body.qty);
      return res.send(updatedUser.cart);
    }
    catch (e) {
      res.status(e.code || 500).send(e.message)
    }
  }

  /**
   * @api {delete} /api/cart/:productId[?all=1] Remove product from cart
   * @apiName removeProductFromCart
   * @apiGroup Cart
   * @apiVersion 0.1.0
   *
   * @apiParam {String} productId Product ID to remove from cart
   * @apiParam {String} all If specified, removes the cart item regardless the quantity.
   *                        Otherwise, it will decrease the quantity (unless the quantity was 1)
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    [
   *       {
   *           qty: 2,
   *           product: {
   *               pictureUrl: "https://s3.amazonaws.com/mycart/product6.png",
   *               oldPrice: 9000,
   *               price: 8500,
   *               name: "Notebook MSI",
   *               __v: 0,
   *               _id: "5b9596046b0838f64c0c5015"
   *           },
   *           _id: "5b9808f81e85e93714670351"
   *       }
   *     ]
   *
   * @apiError InvalidToken Invalid token
   *
   * @apiErrorExample Authentication error
   *    HTTP/1.1 403 Forbidden
   *    {
   *      code: 1000301,
   *      message: "Invalid token.",
   *      detail: {},
   *      errors: ['activation_token']
   *    }
   */
  async removeProductFromCart(req, res) {
    const user = req.current_user
    const updatedUser = await user.removeProductFromCart(req.params.productId, req.query.all)
    res.send(updatedUser.cart)
  }
}

module.exports = new UsersHandler();
