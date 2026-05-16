export interface AppError extends Error{
  statusCode: number;

}

export class InternalServerError implements AppError{
  statusCode: number;
  message: string;
  name: string;
  constructor(message: string = "Internal Server Error"){
    this.statusCode = 500;
    this.message = message;
    this.name = "InternalServerError";
  }
}

export class NotFoundError implements AppError{
  statusCode: number;
  message: string;
  name: string;
  constructor(message: string = "Not Found"){
    this.statusCode = 404;
    this.message = message;
    this.name = "NotFoundError";
  }
}

export class BadRequestError implements AppError{
  statusCode: number;
  message: string;
  name: string;
  constructor(message: string = "Bad Request"){
    this.statusCode = 400;
    this.message = message;
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError implements AppError{
  statusCode: number;
  message: string;
  name: string;
  constructor(message: string = "Unauthorized"){
    this.statusCode = 401;
    this.message = message;
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError implements AppError{
  statusCode: number;
  message: string;
  name: string;
  constructor(message: string = "Forbidden"){
    this.statusCode = 403;
    this.message = message;
    this.name = "ForbiddenError";
  }
}

export class ConflictError implements AppError{
  statusCode: number;
  message: string;
  name: string;
  constructor(message: string = "Conflict"){
    this.statusCode = 409;
    this.message = message;
    this.name = "ConflictError";
  }
}
