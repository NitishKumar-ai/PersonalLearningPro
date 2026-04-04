import { Router } from "express";
import mongoose from "mongoose";
import { isCassandraConnected } from "../lib/cassandra";
import { isMongoConnected } from "../db";

const router = Router();

/**
 * Health check endpoint for database connections
 * GET /api/health
 */
router.get("/", async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 && isMongoConnected();
  const cassandraStatus = isCassandraConnected();

  const health = {
    status: mongoStatus ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    databases: {
      mongodb: {
        connected: mongoStatus,
        readyState: mongoose.connection.readyState,
        readyStateLabel: getMongoReadyStateLabel(mongoose.connection.readyState),
      },
      cassandra: {
        connected: cassandraStatus,
        fallbackToMongo: !cassandraStatus,
      },
    },
  };

  const statusCode = mongoStatus ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * Detailed database health check
 * GET /api/health/detailed
 */
router.get("/detailed", async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 && isMongoConnected();
  const cassandraStatus = isCassandraConnected();

  const health = {
    status: mongoStatus ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    databases: {
      mongodb: {
        connected: mongoStatus,
        readyState: mongoose.connection.readyState,
        readyStateLabel: getMongoReadyStateLabel(mongoose.connection.readyState),
        host: mongoose.connection.host || "unknown",
        name: mongoose.connection.name || "unknown",
      },
      cassandra: {
        connected: cassandraStatus,
        fallbackToMongo: !cassandraStatus,
        keyspace: process.env.ASTRA_DB_KEYSPACE || "not configured",
      },
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  const statusCode = mongoStatus ? 200 : 503;
  res.status(statusCode).json(health);
});

function getMongoReadyStateLabel(state: number): string {
  const states: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return states[state] || "unknown";
}

export default router;
