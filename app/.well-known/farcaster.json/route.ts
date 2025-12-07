import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {
    "frame": {
      "name": "VIRUS APP",
      "version": "1",
      "iconUrl": "https://https://base-farcaster-phwe.vercel.app//icon.png",
      "homeUrl": "https://https://base-farcaster-phwe.vercel.app/",
      "imageUrl": "https://https://base-farcaster-phwe.vercel.app//image.png",
      "splashImageUrl": "https://https://base-farcaster-phwe.vercel.app//splash.png",
      "splashBackgroundColor": "#6200EA",
      "webhookUrl": "https://https://base-farcaster-phwe.vercel.app//api/webhook",
      "subtitle": "EAT THE VIRUS!",
      "description": "enjoy this token based farvaster app",
      "primaryCategory": "games"
    },
    "accountAssociation": {
      "header": "",
      "payload": "",
      "signature": ""
    }
  };

  return NextResponse.json(farcasterConfig);
}
