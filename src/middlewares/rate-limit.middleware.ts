import { rateLimit } from "express-rate-limit";

// General limiter for all API requests
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: "draft-7", // combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: {
      message:
        "Too many requests from this IP, please try again after 15 minutes",
    },
  },
});

// Strict limiter for Auth routes (Login/Register)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // Limit each IP to 5 failed attempts per hour
  skipSuccessfulRequests: true, // Only count 4xx/5xx responses
  message: {
    error: {
      message: "Too many login attempts, please try again after an hour",
    },
  },
});
