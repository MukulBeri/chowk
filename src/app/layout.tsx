import type { Metadata } from "next";
import "./globals.css";
import "./campaign-fonts.css";
import "./site.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: { default: "Chowk — Put your idea on the wall.", template: "%s · Chowk" },
  description: "Turn an idea into a visual campaign. Choose your creative direction, refine the details and create artwork for multiple platforms.",
  openGraph: { title: "Chowk — Put your idea on the wall.", description: "Your intention. New possibilities. Your creative control.", type: "website", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Chowk — Put your idea on the wall." }] },
  twitter: { card: "summary_large_image", title: "Chowk — Put your idea on the wall.", images: ["/opengraph-image.png"] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body><SiteHeader />{children}<SiteFooter /></body>
    </html>
  );
}
