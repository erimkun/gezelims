import fs from 'fs/promises';
import path from 'path';

export class Logger {
  constructor(logDir = './logs') {
    this.logDir = logDir;
    this.logFile = null;
    this.initLogger();
  }

  async initLogger() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.logFile = path.join(this.logDir, `log_${timestamp}.txt`);
    } catch (error) {
      console.error('Logger başlatma hatası:', error);
    }
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      if (data instanceof Error) {
        logMessage += `\n  Error: ${data.message}\n  Stack: ${data.stack}`;
      } else {
        logMessage += `\n  Data: ${JSON.stringify(data, null, 2)}`;
      }
    }
    
    return logMessage;
  }

  async writeLog(message) {
    if (this.logFile) {
      try {
        await fs.appendFile(this.logFile, message + '\n', 'utf-8');
      } catch (error) {
        console.error('Log yazma hatası:', error);
      }
    }
  }

  info(message, data = null) {
    const logMessage = this.formatMessage('INFO', message, data);
    console.log('\x1b[36m%s\x1b[0m', logMessage); // Cyan
    this.writeLog(logMessage);
  }

  success(message, data = null) {
    const logMessage = this.formatMessage('SUCCESS', message, data);
    console.log('\x1b[32m%s\x1b[0m', logMessage); // Green
    this.writeLog(logMessage);
  }

  warn(message, data = null) {
    const logMessage = this.formatMessage('WARN', message, data);
    console.warn('\x1b[33m%s\x1b[0m', logMessage); // Yellow
    this.writeLog(logMessage);
  }

  error(message, data = null) {
    const logMessage = this.formatMessage('ERROR', message, data);
    console.error('\x1b[31m%s\x1b[0m', logMessage); // Red
    this.writeLog(logMessage);
  }

  debug(message, data = null) {
    const logMessage = this.formatMessage('DEBUG', message, data);
    console.log('\x1b[90m%s\x1b[0m', logMessage); // Gray
    this.writeLog(logMessage);
  }
}