
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
  userId?: string;
}

class Logger {
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor() {
    this.logLevel = import.meta.env.PROD ? LogLevel.WARN : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, source?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      source,
      userId: this.getCurrentUserId(),
    };
  }

  private getCurrentUserId(): string | undefined {
    // Get user ID from your auth context/store
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id;
    } catch {
      return undefined;
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // In production, send critical logs to external service
    if (import.meta.env.PROD && entry.level >= LogLevel.ERROR) {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry) {
    // Send to your logging service (e.g., LogRocket, Sentry, etc.)
    // This is a placeholder implementation
    try {
      // Example: Send to your API endpoint
      fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Silently fail to avoid infinite loops
      });
    } catch {
      // Silently fail
    }
  }

  debug(message: string, data?: any, source?: string) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, data, source);
      this.addLog(entry);
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  info(message: string, data?: any, source?: string) {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, message, data, source);
      this.addLog(entry);
      console.info(`[INFO] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any, source?: string) {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, message, data, source);
      this.addLog(entry);
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  error(message: string, error?: Error | any, source?: string) {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, {
        error: error?.message || error,
        stack: error?.stack,
      }, source);
      this.addLog(entry);
      console.error(`[ERROR] ${message}`, error || '');
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  // Performance monitoring
  time(label: string) {
    console.time(label);
  }

  timeEnd(label: string) {
    console.timeEnd(label);
  }

  // Network request logging
  logRequest(url: string, method: string, data?: any) {
    this.debug(`API Request: ${method} ${url}`, data, 'API');
  }

  logResponse(url: string, status: number, data?: any) {
    if (status >= 400) {
      this.error(`API Error: ${status} ${url}`, data, 'API');
    } else {
      this.debug(`API Response: ${status} ${url}`, data, 'API');
    }
  }
}

export const logger = new Logger();

// React Query logger
export const queryLogger = {
  onError: (error: any, query: any) => {
    logger.error('Query Error', { error, queryKey: query.queryKey });
  },
  onSuccess: (data: any, query: any) => {
    logger.debug('Query Success', { queryKey: query.queryKey });
  },
};
