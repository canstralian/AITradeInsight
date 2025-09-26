import { storage } from "./storage";

export interface AuditLog {
  id?: number;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface SecurityEvent {
  type:
    | "LOGIN_ATTEMPT"
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILURE"
    | "MFA_SETUP"
    | "MFA_VERIFY"
    | "TRADE_ATTEMPT"
    | "TRADE_SUCCESS"
    | "TRADE_FAILURE"
    | "RATE_LIMIT_HIT"
    | "SUSPICIOUS_ACTIVITY"
    | "PASSWORD_CHANGE"
    | "ACCOUNT_LOCKED";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  userId?: string;
  details: Record<string, any>;
}

export class AuditLogger {
  static async logAction(
    userId: string,
    action: string,
    resource: string,
    details: Record<string, any>,
    req: any,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW",
  ): Promise<void> {
    const auditLog: AuditLog = {
      userId,
      action,
      resource,
      details,
      ipAddress: req.ip || req.connection.remoteAddress || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      timestamp: new Date(),
      severity,
    };

    try {
      await storage.saveAuditLog(auditLog);

      // Log to console for development
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[AUDIT] ${severity}: ${action} on ${resource} by ${userId}`,
          details,
        );
      }
    } catch (error) {
      console.error("Failed to save audit log:", error);
    }
  }

  static async logSecurityEvent(event: SecurityEvent, req: any): Promise<void> {
    const securityLog = {
      userId: event.userId || "anonymous",
      action: `SECURITY_${event.type}`,
      resource: "SECURITY",
      details: {
        eventType: event.type,
        ...event.details,
      },
      ipAddress: req.ip || req.connection.remoteAddress || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      timestamp: new Date(),
      severity: event.severity,
    };

    try {
      await storage.saveAuditLog(securityLog);

      // Alert on critical security events
      if (event.severity === "CRITICAL") {
        console.error(`[SECURITY ALERT] ${event.type}:`, event.details);
        // In production, this could trigger alerts to security team
      }
    } catch (error) {
      console.error("Failed to log security event:", error);
    }
  }

  static async logTradeActivity(
    userId: string,
    tradeData: Record<string, any>,
    success: boolean,
    req: any,
  ): Promise<void> {
    await this.logAction(
      userId,
      success ? "TRADE_EXECUTED" : "TRADE_FAILED",
      "TRADING",
      {
        ...tradeData,
        success,
      },
      req,
      "HIGH",
    );
  }

  static async getAuditLogs(
    userId?: string,
    action?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    return await storage.getAuditLogs({
      userId,
      action,
      startDate,
      endDate,
      limit,
    });
  }

  static async getSecurityEvents(
    severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return await storage.getAuditLogs({
      action: "SECURITY_%",
      severity,
      limit,
    });
  }
}

// Middleware to automatically log API requests
export const auditMiddleware = (req: any, res: any, next: any) => {
  const originalSend = res.send;

  res.send = function (data: any) {
    const user = req.user;
    // Only log authenticated users and avoid logging auth failures repeatedly
    if (user && user.claims?.sub && req.path !== "/api/auth/user") {
      const severity = res.statusCode >= 400 ? "MEDIUM" : "LOW";
      AuditLogger.logAction(
        user.claims.sub,
        req.method,
        req.path,
        {
          query: req.query,
          body: req.method === "POST" ? req.body : undefined,
          statusCode: res.statusCode,
        },
        req,
        severity,
      ).catch(console.error);
    }

    return originalSend.call(this, data);
  };

  next();
};
