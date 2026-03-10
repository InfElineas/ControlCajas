import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ControlCajas",
  description: "Sistema de gestión de cajas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  );
}
