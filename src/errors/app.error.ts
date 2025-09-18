export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message); // pass message to Error
    this.statusCode = statusCode;

    // restore prototype chain (important when extending built-ins)
    Object.setPrototypeOf(this, new.target.prototype);

    // optional: set a name for easier debugging
    this.name = this.constructor.name;

    // optional: capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
