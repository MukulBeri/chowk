import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Create Lab · Campaign rendering prototype",
  description: "An experimental HTML campaign studio. Three tastes, four formats, one design specification. M0 fixture mode; no live AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
