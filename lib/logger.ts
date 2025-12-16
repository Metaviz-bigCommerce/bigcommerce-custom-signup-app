/**
 * Structured logging utility
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  requestId?: string;
  userId?: string;
  storeHash?: string;
  [key: string]: unknown;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr ? ' ' + contextStr : ''}`;
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext: LogContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : String(error),
    };
    console.error(this.formatMessage('error', message, errorContext));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
}

export const logger = new Logger();

/**
 * Create a logger with default context
 */
export function createLogger(defaultContext: LogContext) {
  return {
    info: (message: string, context?: LogContext) => logger.info(message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext) => logger.warn(message, { ...defaultContext, ...context }),
    error: (message: string, error?: Error | unknown, context?: LogContext) => logger.error(message, error, { ...defaultContext, ...context }),
    debug: (message: string, context?: LogContext) => logger.debug(message, { ...defaultContext, ...context }),
  };
}

