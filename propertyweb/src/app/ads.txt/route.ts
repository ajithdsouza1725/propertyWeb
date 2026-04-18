import { NextResponse } from "next/server";

/** Google certification authority ID for AdSense sellers (fixed). */
const DIRECT_CERT_ID = "f08c47fec0942fa0";

/**
 * Serves https://your-domain/ads.txt from NEXT_PUBLIC_ADSENSE_CLIENT so you do not
 * commit a real publisher ID. AdSense shows the exact line to use during setup.
 */
export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  if (!client || !client.startsWith("ca-pub-")) {
    return new NextResponse(
      [
        "# Configure NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx in .env.local",
        "# Then redeploy. AdSense → Sites → ads.txt shows the exact line if different.",
        "",
      ].join("\n"),
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const pubId = client.replace(/^ca-/, "");
  const body = `google.com, ${pubId}, DIRECT, ${DIRECT_CERT_ID}\n`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
