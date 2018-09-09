class CustomError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code || 500
    this.message = {
      errorMessage: message
    }
  }
}

module.exports = CustomError
