const format = (message) =>
  typeof message === "string" ? message : JSON.stringify(message);

export const logger = {
  info: (message) => console.log(`[INFO] ${format(message)}`),
  warn: (message) => console.warn(`[WARN] ${format(message)}`),
  error: (message) => console.error(`[ERROR] ${format(message)}`),
};
