const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const Product = require('./product')
const CustomError = require('../helpers/customError')

mongoose.Promise = global.Promise

class User extends mongoose.Schema {
  constructor() {
    super({
      email: {
        type: String,
        trim: true,
        required: "Email is required.",
        index: {
          unique: true
        }
      },
      password: {
        type: String,
        required: "Password is required.",
        select: false,
        minlength: [8, "Password is too short."]
      },
      firstname: {
        type: String,
        trim: true,
        required: "First name is required."
      },
      lastname: {
        type: String,
        trim: true,
        required: "Last name is required."
      },
      created_at: {
        type: Date,
        default: Date.now
      },

      whishlist: {
        type: [Product.schema]
      },

      cart: [{
        qty: {
          type: Number,
          min: 0,
          required: true
        },
        product: {
          type: Product.schema,
          required: true
        }
      }]
    });

    this.plugin(require("./plugins/foregroundIndexesPlugin"));
    this.path('email').validate((value) => {
      return /^\w+([\+\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
    }, 'Please fill a valid email address.');

    /**
     * TODO: We have to proper handling these methods as part of the inherited class
     * NOTE: I keep the 'function' notation here, because we DO need to have `this`
     * reference within the function context.
     *
     */
    // hash password before user is saved
    this.pre("save", function(next) {
      if (!this.isModified("password")) {
        return next();
      }

      bcrypt.hash(this.password, null, null, (err, hash) => {
        if (err) return next(err);
        this.password = hash;
        next();
      });
    });

    this.pre("save", function(next) {
      this.wasNew = this.isNew;
      next();
    });

    // method to compare a given password with the database hash
    this.methods.comparePassword = function(password) {
      return bcrypt.compareSync(password, this.password);
    }

    this.methods.asJson = function() {
      return {
        _id: this._id,
        email: this.email,
        firstname: this.firstname,
        lastname: this.lastname
      }
    }

    this.methods.getWhishlist = async function() {
      return this.whishlist || []
    }

    this.methods.addProductToWhishlist = async function(productId) {
      const existentProduct = this.whishlist.find(item => {
        return item._id.toString() === productId
      })

      // add to whishlist only if the product was not already added
      if (!existentProduct) {
        let product
        try {
          product = await Product.findById(productId)
        }
        catch(e) {
          throw new CustomError(400, 'Invalid ID')
        }

        if (!product) {
          throw new CustomError(400, 'The product provided was not found')
        }
        this.whishlist.push(product)
        return this.save()
      }
      throw new CustomError(409, 'Product already exists in the whishlist')
    }

    this.methods.removeProductFromWhishlist = function(productId) {
      let productFound = false
      for (let i = 0; i < this.whishlist.length; i++) {
        if (this.whishlist[i]._id.toString() === productId) {
          productFound = true
          this.whishlist.splice(i, 1)
          break
        }
      }
      if (!productFound) {
        throw new CustomError(400, 'Product does not exist in your whishlist')
      }
      return this.save()
    }

    this.methods.getCart = function() {
      return this.cart || []
    }

    this.methods.addProductToCart = async function(productId, qty) {
      if (qty < 0) {
        throw new CustomError(400, 'Quantity cannot be negative')
      }
      qty = parseInt(qty)
      let product
      try {
        product = await Product.findById(productId)
      }
      catch (e) {
        throw new CustomError(400, 'Invalid ID')
      }
      if (!product) {
        throw new CustomError(400, 'Product not found')
      }
      if (!this.cart) {
        this.cart = []
      }

      let matchedIndex
      this.cart.find((item, index) => {
        if (item.product._id.toString() === productId) {
          matchedIndex = index
        }
      })
      if (matchedIndex >= 0) {
        this.cart[matchedIndex].qty += qty
      }
      else {
        this.cart.push({qty, product})
      }
      return this.save()
    }

    this.methods.removeProductFromCart = function(productId, all) {
      for (let i = 0; i < this.cart.length; i++) {
        if (this.cart[i].product._id.toString() === productId) {
          if (!all && this.cart[i].qty > 1) {
            this.cart[i].qty--
          } else {
            this.cart.splice(i, 1)
          }
          break
        }
      }
      return this.save()
    }
  }
}

module.exports = mongoose.model('User', new User());
