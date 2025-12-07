import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {
    // TODO: Add your own account association
    frame: {
      version: "1",
      name: "Virus Eater Lab",
      iconUrl: `${APP_URL}/images/virus-icon.png`, // We will need to make sure this exists or use a placeholder
      homeUrl: `${APP_URL}`,
      imageUrl: `${APP_URL}/images/virus-preview.png`,
      screenshotUrls: [],
      tags: ["game", "farcaster", "virus", "strategy"],
      primaryCategory: "gaming",
      buttonTitle: "Enter Lab",
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: "#022c22", // emerald-950
      webhookUrl: `${APP_URL}/api/webhook`,
    },
  };

  return NextResponse.json(farcasterConfig);
}
