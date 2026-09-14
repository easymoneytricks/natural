import "../src/config/env.js";

if (process.env.NODE_ENV !== "production") {
  throw new Error(
    "Set NODE_ENV=production before running validate:production.",
  );
}

console.log("Production environment configuration is valid.");
