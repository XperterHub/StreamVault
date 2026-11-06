# StreamVault - Cinema Multi-Audio Streaming Platform

A cinema streaming platform with direct Google Drive cloud streaming, Google AdSense/IMA video ads, and an Admin Management Console.

## 🚀 Features

- **Google Drive Stream Proxy**: High-throughput chunked video streaming directly from Google Drive master files without client-side API credentials.
- **Google AdSense & IMA SDK**: Official Google Interactive Media Ads (IMA) HTML5 SDK integration supporting pre-roll, mid-roll, and post-roll video ads with publisher ID configuration.
- **Multi-Language Audio & Subtitles**: Synchronized multi-track audio switching (e.g., English, Tamil, etc.) and closed captions.
- **Google Cloud / Firebase Authentication**: Google OAuth sign-in integration and tiered viewer accounts (Free & VIP Premium).
- **Custom Player Controls**: Smooth +10s / -10s skip animations, cinema scrubber, picture-in-picture, and fullscreen.
- **Admin Management Console**: Vite/React management portal on port 3001 for ingesting videos, configuring AdSense, setting up coupons, and managing DRM security shields.

## 📂 Architecture

- `/disney-plus-main`: Next.js 13 viewer streaming application (Port 3000)
- `/admin-portal`: Vite + React + Tailwind management console (Port 3001)
- `/data`: Shared platform database (`shared_streamvault.json`)

## 🛠️ Quick Start

### 1. Viewer Portal
```bash
cd disney-plus-main
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 2. Admin Console
```bash
cd admin-portal
npm install
npm run dev
```
Open [http://localhost:3001](http://localhost:3001)

## 🔑 Environment Setup

Copy `.env.example` to `.env` in `disney-plus-main`:
```env
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_ID=your_google_cloud_client_id
GOOGLE_SECRET=your_google_cloud_client_secret
```

