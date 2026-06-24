#!/usr/bin/env node

/**
 * Logging Utility
 * All automation scripts log to files + console
 * Easy debugging and monitoring
 */

const fs = require('fs');
const path = require('path');

const LOGS_FOLDER = path.join(__dirname, 'logs');

// Ensure logs folder exists
if (!fs.existsSync(LOGS_FOLDER)) {
  fs.mkdirSync(LOGS_FOLDER, { recursive: true });
}

/**
 * Get timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Get log file path
 */
function getLogFilePath(scriptName) {
  const date = new Date().toISOString().split('T')[0];
  return path.join(LOGS_FOLDER, `${scriptName}-${date}.log`);
}

/**
 * Logger class
 */
class Logger {
  constructor(scriptName) {
    this.scriptName = scriptName;
    this.logFile = getLogFilePath(scriptName);
  }

  /**
   * Write to file
   */
  write(message) {
    const timestamp = getTimestamp();
    const formatted = `[${timestamp}] ${message}`;

    try {
      fs.appendFileSync(this.logFile, formatted + '\n', 'utf8');
    } catch (err) {
      console.error('Failed to write log:', err.message);
    }
  }

  /**
   * Log info
   */
  info(message) {
    console.log(`ℹ️  ${message}`);
    this.write(`[INFO] ${message}`);
  }

  /**
   * Log success
   */
  success(message) {
    console.log(`✅ ${message}`);
    this.write(`[SUCCESS] ${message}`);
  }

  /**
   * Log warning
   */
  warn(message) {
    console.log(`⚠️  ${message}`);
    this.write(`[WARN] ${message}`);
  }

  /**
   * Log error
   */
  error(message) {
    console.error(`❌ ${message}`);
    this.write(`[ERROR] ${message}`);
  }

  /**
   * Log debug (verbose)
   */
  debug(message) {
    if (process.env.DEBUG === 'true') {
      console.log(`🔍 ${message}`);
    }
    this.write(`[DEBUG] ${message}`);
  }

  /**
   * Get log file path
   */
  getPath() {
    return this.logFile;
  }

  /**
   * Read recent logs
   */
  readRecent(lines = 50) {
    try {
      const content = fs.readFileSync(this.logFile, 'utf8');
      return content.split('\n').slice(-lines).join('\n');
    } catch {
      return '(no logs yet)';
    }
  }

  /**
   * Clear old logs (older than days)
   */
  static cleanOldLogs(days = 7) {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      const files = fs.readdirSync(LOGS_FOLDER);
      files.forEach(file => {
        const filePath = path.join(LOGS_FOLDER, file);
        const stat = fs.statSync(filePath);
        if (stat.mtime < cutoff) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Deleted old log: ${file}`);
        }
      });
    } catch (err) {
      console.error('Error cleaning logs:', err.message);
    }
  }
}

module.exports = Logger;
