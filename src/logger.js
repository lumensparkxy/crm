const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
  }

  log(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const logLevel = LOG_LEVELS[level] !== undefined ? level : 'INFO';
    
    if (LOG_LEVELS[logLevel] <= LOG_LEVELS[this.level]) {
      console.log(`[${timestamp}] [${logLevel}] ${message}`, ...args);
    }
  }

  error(message, ...args) {
    this.log('ERROR', message, ...args);
  }

  warn(message, ...args) {
    this.log('WARN', message, ...args);
  }

  info(message, ...args) {
    this.log('INFO', message, ...args);
  }

  debug(message, ...args) {
    this.log('DEBUG', message, ...args);
  }
}

module.exports = new Logger();