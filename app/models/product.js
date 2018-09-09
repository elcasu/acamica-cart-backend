const mongoose = require('mongoose')
const s3Manager = require("../helpers/s3Manager")

class Product extends mongoose.Schema {
  constructor() {
    super({
      name: {
        type: String,
        trim: true,
        required: "Name is required.",
        index: {
          unique: true
        }
      },

      price: {
        type: Number,
        required: "Price is required."
      },

      oldPrice: {
        type: Number,
        required: "Old price is required."
      },

      pictureUrl: {
        type: String
      },

      picture: {
        original_file: {
          fieldname: String,
          originalname: String,
          name: String,
          encoding: String,
          mimetype: {
            type: String,
            default: ''
          },
          path: String,
          extension: String,
          size: Number,
          truncated: Boolean,
          buffer: Buffer
        },
        path: String,
        url: String
      },
    })

    this.pre('save', function(next) {
      if (!this.isModified("picture")) {
        return next();
      }

      if (this.picture && this.picture.original_file && this.picture.original_file.name) {
        s3Manager.uploadFile(this.picture.original_file, "picture/" + this._id, (err, path) => {
          if (err) return next(err);

          this.set("picture.path", path);
          this.set("picture.url", process.env.AWS_URL_BASE + process.env.AWS_S3_BUCKET_NAME + "/" + path);
          next();
        });
      }
      next()
    });

    this.statics.create = function(data) {
      const product = new this()
      product.name = data.name
      product.price = data.price
      product.oldPrice = data.oldPrice
      product.pictureUrl = data.pictureUrl
      return product.save()
    }

    this.statics.getProducts = async function() {
      const products = await this.find({})
      return products || []
    }

    this.methods.asJson = function() {
      return {
        _id: this._id,
        name: this.name,
        price: this.price,
        oldPrice: this.oldPrice,
        picture: this.picture
      }
    }
  }
}

module.exports = mongoose.model('Product', new Product());
