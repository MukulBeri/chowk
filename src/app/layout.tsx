import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Create Lab · Campaign rendering prototype",
  description: "An AI-powered HTML campaign studio with three tastes, four adaptive formats, inspectable specifications and an independent local planner.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
