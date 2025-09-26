import { z } from "zod";

// Common validation schemas
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .max(254, "Email too long");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one lowercase letter, one uppercase letter, and one number",
  );

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format")
  .optional();

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name too long")
  .regex(/^[a-zA-Z\s\-'\.]+$/, "Name contains invalid characters");

// Trading-specific schemas
export const stockSymbolSchema = z
  .string()
  .min(1, "Stock symbol is required")
  .max(10, "Stock symbol too long")
  .regex(/^[A-Z]+$/, "Stock symbol must be uppercase letters only");

export const amountSchema = z
  .number()
  .positive("Amount must be positive")
  .max(1000000000, "Amount too large"); // $1B limit

export const percentageSchema = z
  .number()
  .min(0, "Percentage cannot be negative")
  .max(100, "Percentage cannot exceed 100");

// User registration schema
export const userRegistrationSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  experience: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  riskTolerance: z.enum([
    "conservative",
    "moderate",
    "aggressive",
    "very-aggressive",
  ]),
  investmentGoals: z
    .array(z.string())
    .min(1, "At least one investment goal is required"),
  initialInvestment: z.string(),
  tradingStyle: z.enum([
    "day-trading",
    "swing-trading",
    "position-trading",
    "buy-and-hold",
    "mixed",
  ]),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, "Terms must be accepted"),
  newsletterSubscription: z.boolean().optional(),
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Portfolio schemas
export const portfolioUpdateSchema = z.object({
  positions: z.array(
    z.object({
      symbol: stockSymbolSchema,
      shares: z.number().positive("Shares must be positive"),
      averagePrice: amountSchema,
    }),
  ),
});

// Watchlist schemas
export const addToWatchlistSchema = z.object({
  symbol: stockSymbolSchema,
  notes: z.string().max(500, "Notes too long").optional(),
});

// Trade schemas
export const tradeSchema = z.object({
  symbol: stockSymbolSchema,
  type: z.enum(["buy", "sell"]),
  quantity: z.number().positive("Quantity must be positive"),
  price: amountSchema.optional(),
  orderType: z.enum(["market", "limit", "stop-loss"]),
});

// Validation middleware factory
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
              code: err.code,
            })),
          },
        });
      }
      next(error);
    }
  };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Query validation failed",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
              code: err.code,
            })),
          },
        });
      }
      next(error);
    }
  };
}

export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Parameter validation failed",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
              code: err.code,
            })),
          },
        });
      }
      next(error);
    }
  };
}

// Sanitization utilities
export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ""); // Remove event handlers
};

export const sanitizeObject = (obj: any): any => {
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};
