import type { Metadata } from "next";
import React from "react";
import "../globals.css";
import Navbar from "../../components/Navbar";

export const metadata: Metadata = {
  title: "GhostOpinion",
  description: "An Anonymous messaging app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
