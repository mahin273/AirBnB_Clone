export interface AppError extends Error{
  statusCode: number;

}

export class InternalServerError implements AppError{
  statusCode: number;
  message: string;
  name: string;
  constructor(){
    this.statusCode = 500;
    this.message = "Internal Server Error";
    this.name = "InternalServerError";
  }
}

export class NotFoundError implements AppError{
  statusCode: number;
  message: string;
  name: string;
  constructor(){
    this.statusCode = 404;
    this.message = "Not Found";
    this.name = "NotFoundError";
  }
}

export class BadRequestError implements AppError{
  statusCode: number;
  message: string;
  name: string;
  constructor(){
    this.statusCode = 400;
    this.message = "Bad Request";
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError implements AppError{
  statusCode: number;
  message: string;
  name: string;
  constructor(){
    this.statusCode = 401;
    this.message = "Unauthorized";
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError implements AppError{
  statusCode: number;
  message: string;
  name: string;
  constructor(){
    this.statusCode = 403;
    this.message = "Forbidden";
    this.name = "ForbiddenError";
  }
}

export class ConflictError implements AppError{
  statusCode: number;
  message: string;
  name: string;
  constructor(){
    this.statusCode = 409;
    this.message = "Conflict";
    this.name = "ConflictError";
  }
}
