export function getAppSessionSecret() {
  if (process.env.APP_SESSION_SECRET) {
    return process.env.APP_SESSION_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_SESSION_SECRET must be configured in production.");
  }

  return "local-development-session-secret";
}
