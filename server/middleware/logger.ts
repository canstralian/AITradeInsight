import { Request, Response, NextFunction } from "express";

interface LogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  data?: any;
  requestId?: string;
}

class ServerLogger {
  private logLevel: string;

  constructor() {
    this.logLevel =
      process.env.LOG_LEVEL ||
      (process.env.NODE_ENV === "production" ? "info" : "debug");
  }

  private shouldLog(level: string): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return (
      levels[level as keyof typeof levels] >=
      levels[this.logLevel as keyof typeof levels]
    );
  }

  private createLogEntry(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    data?: any,
    requestId?: string,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      requestId,
    };
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, data, requestId } = entry;
    const prefix = `[${timestamp}] ${level.toUpperCase()}${requestId ? ` [${requestId}]` : ""}`;
    const dataStr = data ? ` ${JSON.stringify(data)}` : "";
    return `${prefix}: ${message}${dataStr}`;
  }

  debug(message: string, data?: any, requestId?: string) {
    if (this.shouldLog("debug")) {
      const entry = this.createLogEntry("debug", message, data, requestId);
      console.log(this.formatLog(entry));
    }
  }

  info(message: string, data?: any, requestId?: string) {
    if (this.shouldLog("info")) {
      const entry = this.createLogEntry("info", message, data, requestId);
      console.info(this.formatLog(entry));
    }
  }

  warn(message: string, data?: any, requestId?: string) {
    if (this.shouldLog("warn")) {
      const entry = this.createLogEntry("warn", message, data, requestId);
      console.warn(this.formatLog(entry));
    }
  }

  error(message: string, data?: any, requestId?: string) {
    if (this.shouldLog("error")) {
      const entry = this.createLogEntry("error", message, data, requestId);
      console.error(this.formatLog(entry));
    }
  }
}

export const logger = new ServerLogger();

// Request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();
  const requestId = req.get("X-Request-ID");

  // Log incoming request
  logger.info(
    "Incoming request",
    {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      contentLength: req.get("Content-Length"),
    },
    requestId,
  );

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "warn" : "info";

    logger[logLevel](
      "Request completed",
      {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get("Content-Length"),
      },
      requestId,
    );
  });

  next();
};
