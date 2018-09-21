const express = require("express");
const token_authentication = require("../middleware/auth");
const handlers = require('../handlers');

class Routes {

  constructor() {
    this.appRoutes = express.Router();

    // ########## Authentication Route ##########
    this.appRoutes.post('/users/authenticate', handlers.users.authenticate)

    // ############## Users Routes ##############
    // Register new user
    this.appRoutes.post('/users', handlers.users.createUser);


    // ### Wishlist
    this.appRoutes.get('/wishlist', token_authentication(), handlers.users.getWishlist)
    this.appRoutes.post('/wishlist', token_authentication(), handlers.users.addProductToWishlist)
    this.appRoutes.delete('/wishlist/:productId', token_authentication(), handlers.users.removeProductFromWishlist)

    // ### Cart
    this.appRoutes.get('/cart', token_authentication(), handlers.users.getCart)
    this.appRoutes.post('/cart', token_authentication(), handlers.users.addProductToCart)
    this.appRoutes.delete('/cart/:productId', token_authentication(), handlers.users.removeProductFromCart)

    // ############## Users Routes ##############
    this.appRoutes.get('/products', handlers.products.getProducts)
  }

  get() {
    return this.appRoutes;
  }
}

module.exports = new Routes();
