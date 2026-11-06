import type { NextApiRequest, NextApiResponse } from "next";
import https from "https";
import http from "http";
import { URL } from "url";

export function extractDriveFileId(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  
  // If it's a full Google Drive link: /file/d/<id>/view or /d/<id>
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];

  // If it has id=<id>
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];

  // If it's already a raw ID (usually 28-44 chars of alphanumeric, dashes, underscores)
  const rawMatch = trimmed.match(/^([a-zA-Z0-9_-]{25,})$/);
  if (rawMatch && rawMatch[1]) return rawMatch[1];

  // General fallback search for 25+ token
  const genericMatch = trimmed.match(/([a-zA-Z0-9_-]{25,})/);
  if (genericMatch && genericMatch[1]) return genericMatch[1];

  return trimmed;
}

function fetchWithRedirects(
  targetUrl: string,
  headers: Record<string, string | string[] | undefined>,
  redirectCount = 0
): Promise<{ response: http.IncomingMessage; finalUrl: string }> {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      return reject(new Error("Too many redirects"));
    }

    const parsed = new URL(targetUrl);
    const client = parsed.protocol === "https:" ? https : http;

    const requestHeaders: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "*/*",
      Connection: "keep-alive",
    };

    if (headers["range"]) {
      requestHeaders["Range"] = String(headers["range"]);
    }

    const req = client.request(
      parsed,
      {
        method: "GET",
        headers: requestHeaders,
      },
      (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const redirectUrl = new URL(res.headers.location, targetUrl).toString();
          res.resume(); // Discard redirect body
          return resolve(fetchWithRedirects(redirectUrl, headers, redirectCount + 1));
        }

        resolve({ response: res, finalUrl: targetUrl });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS and Streaming Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range, Content-Range, Content-Type, Accept-Ranges");
  res.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id, url: rawUrl } = req.query;
  const inputSource = (id || rawUrl || "") as string;

  if (!inputSource) {
    return res.status(400).json({ error: "Missing video id or url parameter" });
  }

  // Handle direct non-Google Drive video URLs (e.g. .mp4 or .webm)
  if (inputSource.startsWith("http") && !inputSource.includes("drive.google.com") && !inputSource.includes("drive.usercontent.google.com")) {
    try {
      const { response: upstreamRes } = await fetchWithRedirects(inputSource, req.headers);
      res.writeHead(upstreamRes.statusCode || 200, {
        "Content-Type": upstreamRes.headers["content-type"] || "video/mp4",
        "Content-Length": upstreamRes.headers["content-length"] || "",
        ...(upstreamRes.headers["content-range"] ? { "Content-Range": upstreamRes.headers["content-range"] } : {}),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      });
      upstreamRes.pipe(res);
      req.on("close", () => {
        upstreamRes.destroy();
      });
      return;
    } catch (err: any) {
      return res.status(502).json({ error: "Failed to stream external video: " + err.message });
    }
  }

  const driveFileId = extractDriveFileId(inputSource);
  if (!driveFileId) {
    return res.status(400).json({ error: "Could not extract Google Drive File ID" });
  }

  // Google Drive direct download and streaming endpoint
  const driveStreamUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(
    driveFileId
  )}&export=download&confirm=t`;

  try {
    const { response: upstreamRes } = await fetchWithRedirects(driveStreamUrl, req.headers);

    const statusCode = upstreamRes.statusCode || 200;
    const responseHeaders: Record<string, string> = {
      "Content-Type": upstreamRes.headers["content-type"] || "video/mp4",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    };

    if (upstreamRes.headers["content-length"]) {
      responseHeaders["Content-Length"] = String(upstreamRes.headers["content-length"]);
    }
    if (upstreamRes.headers["content-range"]) {
      responseHeaders["Content-Range"] = String(upstreamRes.headers["content-range"]);
    }

    res.writeHead(statusCode, responseHeaders);

    upstreamRes.pipe(res);

    req.on("close", () => {
      upstreamRes.destroy();
    });
  } catch (error: any) {
    console.error("[StreamVault Stream Proxy Error]:", error);
    if (!res.headersSent) {
      res.status(502).json({ error: "Failed to connect to Google Drive stream: " + error.message });
    }
  }
}

