import type { Metadata } from "next";
import "./globals.css";
import "./campaign-fonts.css";

export const metadata: Metadata = {
  title: "Create Studio · Campaign workspace",
  description: "An AI-powered HTML campaign studio with three tastes, four adaptive formats, inspectable specifications and an independent local planner.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
