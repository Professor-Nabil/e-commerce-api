# ⚙️ New Session: Logging (Winston & Morgan)

When your API is in production, `console.log` isn't enough. It's not persistent, and it doesn't give you levels (Info vs. Error). We’ll use **Winston** for structured logging (saving errors to files) and **Morgan** for HTTP request logging.

### 🛠️ 1. Install Dependencies

```bash
npm install winston morgan
npm install -D @types/morgan
```

### 📝 2. Configure Winston (`src/config/logger.ts`)

We want to log everything to the console in development, but in production, we want errors saved to an `error.log` file.

```typescript
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
```

### 🔌 3. Integrate Morgan & Winston in `src/app.ts`

Morgan will log every incoming HTTP request. We'll pipe Morgan's output into Winston.

```typescript
// ... other imports
import morgan from "morgan";
import logger from "./config/logger.js";

const app = express();

// 1. TOP MIDDLEWARES
app.use(cors());
app.use(express.json());

// Log HTTP requests
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

app.use("/api", apiLimiter);
// ...
```

### 🚨 4. Update Error Middleware (`src/middlewares/error.middleware.ts`)

This is the most important part: **Logging actual stack traces** when things break.

```typescript
import { Request, Response, NextFunction } from "express";
import logger from "../config/logger.js"; // 👈 Import logger

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;

  // Log the error details
  logger.error(
    `${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - Stack: ${err.stack}`,
  );

  res.status(statusCode).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
};
```

### 🧪 5. Verification

1. Create a `logs` folder (though Winston usually creates it automatically).
2. Trigger an error (e.g., try to GET a product that doesn't exist if you throw an error there, or just hit a broken route).
3. Check `logs/error.log`. You should see structured JSON data with the timestamp and stack trace.

Does this setup look good for your "Invisible Quality" checklist, or should we add **Log Rotation** (so your `combined.log` doesn't grow to 50GB over time)?
