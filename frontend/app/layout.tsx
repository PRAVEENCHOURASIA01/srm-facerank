import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SRM FaceRank",
    template: "%s | SRM FaceRank",
  },
  description: "The ultimate campus photo ranking game",
  openGraph: {
    title: "SRM FaceRank",
    description: "Vote. Rank. Dominate.",
    type: "website",
  },
  metadataBase: new URL("https://srm-facerank.vercel.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.className} bg-gray-950 text-white min-h-screen antialiased`}
      >
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#111827",
              color: "#fff",
              border: "1px solid #1f2937",
            },
            success: {
              iconTheme: {
                primary: "#ec4899",
                secondary: "#fff",
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
