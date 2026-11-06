import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const SHARED_DB_PATH = path.resolve(process.cwd(), "..", "data", "shared_streamvault.json");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS so admin portal on port 3001 can sync seamlessly
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "GET") {
      if (fs.existsSync(SHARED_DB_PATH)) {
        const raw = fs.readFileSync(SHARED_DB_PATH, "utf-8");
        return res.status(200).json(JSON.parse(raw));
      } else {
        return res.status(200).json({ videos: [], coupons: [], users: [], settings: {} });
      }
    }

    if (req.method === "POST") {
      const data = req.body;
      fs.writeFileSync(SHARED_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
      return res.status(200).json({ success: true, message: "StreamVault Shared Database Synchronized Successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to access shared database" });
  }
}

