const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

const plugins = [`medusa-payment-manual`, `medusa-fulfillment-manual`]; // Add any Medusa plugins here

module.exports = {
  projectConfig: {
    database_url: process.env.DATABASE_URL,
    jwt_secret: process.env.JWT_SECRET,
    cookie_secret: process.env.COOKIE_SECRET,
    database_logging: false,
    store_cors: process.env.STORE_CORS || "http://localhost:3000", // Adjusted for Next.js default port
    admin_cors: process.env.ADMIN_CORS || "http://localhost:7000", // Adjust as needed for your admin panel
    redis_url: process.env.REDIS_URL || undefined,
  },
  plugins,
};
