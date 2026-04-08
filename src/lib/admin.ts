export function getAdminCredentials() {
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    return {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    };
  }

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return {
    email: "admin@example.com",
    password: "change-me-now",
  };
}

export function isUsingDefaultAdminCredentials() {
  return process.env.NODE_ENV !== "production" && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD);
}
