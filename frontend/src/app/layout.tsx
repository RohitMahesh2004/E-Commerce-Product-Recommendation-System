import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "AI Product Recommender",
  description: "Personalized E-commerce Recommendations with LLM Explanations",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
