import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calead",
  description: "Agente qualificador Calead — Human First",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
