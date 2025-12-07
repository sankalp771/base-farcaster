# Virus Eater Lab - Farcaster Deployment Plan

To launch "Virus Eater Lab" as a Farcaster MiniApp (Frame v2), follow these steps:

## 1. Prepare Branding (Manifest)
We need to update the `farcaster.json` manifest so users see "Virus Eater Lab" instead of "Template".

**Action Item**: Update `app/.well-known/farcaster.json/route.ts`.
- **Name**: "Virus Eater Lab"
- **Icon**: A virus/biohazard icon (we can generate one or use a placeholder).
- **Splash Screen**: A sleek dark emerald background.

## 2. Deploy to Vercel (Hosting)
The app must be live on HTTPS. Vercel is the easiest path.

**Steps**:
1.  **Push Code**: Commit your changes and push to GitHub/GitLab.
2.  **Import to Vercel**: 
    - Go to Vercel Dashboard -> Add New Project -> Import your repo.
3.  **Environment Variables**:
    - Add `NEXT_PUBLIC_URL`: Your Vercel domain (e.g., `https://virus-eater-lab.vercel.app`).
    - Add `NEXT_PUBLIC_PROJECT_ID`: Your Reown/WalletConnect Project ID.

## 3. Register & Test
Once deployed, you can test it directly in Warpcast.

**Steps**:
1.  **Developer Playground**: Go to [Warpcast Playground](https://warpcast.com/~/developers/frames).
2.  **Create Frame**: 
    - Enter your URL (e.g., `https://virus-eater-lab.vercel.app`).
    - It should detect the `/.well-known/farcaster.json`.
3.  **Cast**: You can cast the link in Warpcast. It will appear as a "Launch Frame" button.

## 4. Immediate Next Step
I will update the `farcaster.json` route file right now to match your Virus Lab theme.
