import dotenv from "dotenv";
dotenv.config();
export const env = {
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  dbFile: process.env.DB_FILE || "./data/restaurant.db",
  jwtSecret: process.env.JWT_SECRET || "change-this-secret"
};
