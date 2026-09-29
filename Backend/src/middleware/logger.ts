import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  
  // Attach requestId to request for traceability if needed
  (req as any).requestId = requestId;

  // Wait for the response to finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;

    // Do NOT log bodies here to prevent leaking passwords, JWTs, OTPs, etc.
    // Only log essential access metrics
    console.log(`[${new Date().toISOString()}] [ReqID: ${requestId}] ${method} ${url} - ${status} - ${duration}ms`);
  });

  next();
}
