import { randomInt } from "crypto";
import { UAParser } from "ua-parser-js";
import { Request } from "express";
import rateLimit from "express-rate-limit";

// ─── Code Generation ─────────────────────────────────────────────────────────

export function generateSecureCode(): string {
  // Generates a random 6-digit number between 100000 and 999999
  const code = randomInt(100000, 1000000);
  return code.toString();
}

// ─── Device Parsing ──────────────────────────────────────────────────────────

export function parseDevice(req: Request) {
  const uaHeader = req.headers["user-agent"] || "";
  const parser = new UAParser(uaHeader);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  const browserName = browser.name || "Unknown Browser";
  const osName = os.name || "Unknown OS";
  
  // Format like "Chrome on Windows"
  const deviceName = `${browserName} on ${osName}`;

  return {
    deviceName,
    browser: browserName,
    operatingSystem: osName,
    isMobile: device.type === "mobile" || device.type === "tablet",
  };
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login requests per windowMs
  message: { error: "Too many login attempts from this IP, please try again after 15 minutes." },
});

export const verificationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 verification requests per windowMs
  message: { error: "Too many verification attempts, please try again later." },
});
