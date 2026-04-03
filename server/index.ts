import "dotenv/config";
import { logger } from "./lib/logger";

// Prevent unhandled promise rejections from crashing the server
process.on('unhandledRejection', (reason: any) => {
  logger.error('[unhandledRejection] non-fatal:', reason);
});
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { connectMongoDB } from "./db";
import { setupChatWebSocket } from "./chat-ws";
import { setupMessagePalWebSocket, startMessagePalServer } from "./message";
import { initCassandra } from "./lib/cassandra";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files
app.use("/uploads", express.static(path.resolve("public", "uploads")));

// Initialize Databases
connectMongoDB();
initCassandra();

// Set up session middleware
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error("SESSION_SECRET environment variable is required in production. Set it in your .env file.");
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'master-plan-ai-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  store: storage.sessionStore
}));

app.use(logger.requestLogger);

(async () => {
  const server = await registerRoutes(app);

  // Attach WebSocket servers
  setupChatWebSocket(server, storage.sessionStore);
  setupMessagePalWebSocket(server, storage.sessionStore);

  // Start Message HTTP server
  startMessagePalServer();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    try {
      await setupVite(app, server);
    } catch (error) {
      if (error && (error as any).code === 'ERR_MODULE_NOT_FOUND') {
        logger.info("Vite not found. Assuming production mode and falling back to static serving.");
        serveStatic(app);
      } else {
        throw error;
      }
    }
  } else {
    serveStatic(app);
  }

  // Use port strictly if provided by Render/environment, otherwise default to 5001
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5001", 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    logger.info(`serving on port ${port}`);
  });
})();
