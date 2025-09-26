import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || "INTERNAL_ERROR";
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error classes
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

// Error handler middleware
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Set default error values
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";
  let code = error.code || "INTERNAL_ERROR";
  let details = error.details;

  // Handle different error types
  if (error.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Validation failed";
    details = error.details || error.message;
  } else if (error.name === "CastError") {
    statusCode = 400;
    code = "INVALID_DATA";
    message = "Invalid data format";
  } else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "Invalid authentication token";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    code = "TOKEN_EXPIRED";
    message = "Authentication token expired";
  } else if (
    error.name === "MongoNetworkError" ||
    error.name === "MongooseServerSelectionError"
  ) {
    statusCode = 503;
    code = "DATABASE_ERROR";
    message = "Database connection failed";
  }

  // Log the error
  const logData = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code,
      statusCode,
      details,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: (req as any).user?.id,
    },
  };

  if (statusCode >= 500) {
    logger.error("Server error occurred", logData);
  } else {
    logger.warn("Client error occurred", logData);
  }

  // Don't expose error details in production
  const isProduction = process.env.NODE_ENV === "production";
  const errorResponse: any = {
    success: false,
    error: {
      code,
      message:
        isProduction && statusCode >= 500 ? "Internal Server Error" : message,
    },
  };

  // Add details in development or for client errors
  if (!isProduction || statusCode < 500) {
    if (details) {
      errorResponse.error.details = details;
    }
    if (!isProduction && error.stack) {
      errorResponse.error.stack = error.stack;
    }
  }

  // Add request ID for tracking
  const requestId = req.get("X-Request-ID") || generateRequestId();
  errorResponse.requestId = requestId;

  res.status(statusCode).json(errorResponse);
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const error = new NotFoundError(`Route ${req.method} ${req.url}`);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Unhandled rejection handler
export const handleUnhandledRejections = () => {
  process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    logger.error("Unhandled promise rejection", {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString(),
    });

    // Graceful shutdown
    process.exit(1);
  });
};

// Uncaught exception handler
export const handleUncaughtExceptions = () => {
  process.on("uncaughtException", (error: Error) => {
    logger.error("Uncaught exception", {
      error: error.message,
      stack: error.stack,
    });

    // Graceful shutdown
    process.exit(1);
  });
};

// Utility functions
const generateRequestId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Request ID middleware
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = req.get("X-Request-ID") || generateRequestId();
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
};
