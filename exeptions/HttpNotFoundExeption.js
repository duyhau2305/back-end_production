class HttpNotFoundException extends Error {
  constructor(message) {
    super(message);
    this.name = 'HttpNotFoundException';
    this.httpStatusCode = 404;
  }
}
module.exports = HttpNotFoundException;