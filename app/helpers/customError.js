class CustomError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code || 500
    this.message = {
      message: message
    }
  }
}

module.exports = CustomError
