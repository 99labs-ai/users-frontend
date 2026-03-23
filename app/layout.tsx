import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Users App",
  description: "Users CRUD",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
