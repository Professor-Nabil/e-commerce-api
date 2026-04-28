import winston from "winston";

const { combine, timestamp, printf, colorize, json } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
  transports: [
    // 1. Write all logs with level 'error' to error.log
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // 2. Write all logs to combined.log
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// If we're in development, also log to the console with colors
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), myFormat),
    }),
  );
}

export default logger;
