interface AppConfig {
  apiUrl: string;
  environment: "development" | "production" | "test";
  features: {
    enableMockData: boolean;
    enableErrorReporting: boolean;
    enableAnalytics: boolean;
    enableDevTools: boolean;
  };
  api: {
    timeout: number;
    retries: number;
    rateLimit: {
      requests: number;
      window: number; // in milliseconds
    };
  };
  ui: {
    theme: "light" | "dark" | "system";
    animations: boolean;
    tooltips: boolean;
  };
  security: {
    enableCSP: boolean;
    tokenRefreshBuffer: number; // minutes
    sessionTimeout: number; // minutes
  };
}

const config: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || "",
  environment: (import.meta.env.MODE as any) || "development",

  features: {
    enableMockData: import.meta.env.DEV,
    enableErrorReporting: import.meta.env.PROD,
    enableAnalytics: import.meta.env.PROD,
    enableDevTools: import.meta.env.DEV,
  },

  api: {
    timeout: 30000, // 30 seconds
    retries: 3,
    rateLimit: {
      requests: 100,
      window: 60000, // 1 minute
    },
  },

  ui: {
    theme: "dark",
    animations: true,
    tooltips: true,
  },

  security: {
    enableCSP: import.meta.env.PROD,
    tokenRefreshBuffer: 5, // 5 minutes before expiry
    sessionTimeout: 30, // 30 minutes
  },
};

// Validation
const validateConfig = () => {
  const errors: string[] = [];

  // Validate required environment variables in production
  if (config.environment === "production") {
    if (!config.apiUrl) {
      errors.push("VITE_API_URL is required in production");
    }
  }

  // Validate numeric values
  if (config.api.timeout <= 0) {
    errors.push("API timeout must be greater than 0");
  }

  if (config.api.retries < 0) {
    errors.push("API retries must be 0 or greater");
  }

  if (errors.length > 0) {
    console.error("Configuration validation failed:", errors);
    if (config.environment === "production") {
      throw new Error(`Invalid configuration: ${errors.join(", ")}`);
    }
  }
};

// Validate on import
validateConfig();

export { config, type AppConfig };

// Helper functions
export const isDevelopment = () => config.environment === "development";
export const isProduction = () => config.environment === "production";
export const isTest = () => config.environment === "test";

// Feature flags
export const isFeatureEnabled = (
  feature: keyof AppConfig["features"],
): boolean => {
  return config.features[feature];
};

// Environment-specific configurations
export const getApiConfig = () => ({
  baseUrl: config.apiUrl,
  timeout: config.api.timeout,
  retries: config.api.retries,
});

export const getSecurityConfig = () => config.security;
export const getUIConfig = () => config.ui;
