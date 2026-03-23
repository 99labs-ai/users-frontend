import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";

export const metadata: Metadata = {
  title: "Users App",
  description: "Users CRUD",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
