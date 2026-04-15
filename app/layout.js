import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

export const metadata = {
  title: "TPOM - The Pre-Owned Market",
  description: "Cars, Bikes & Home Appliances",
  icons: {
    icon: "/tpom-logo.webp",
    shortcut: "/tpom-logo.webp",
    apple: "/tpom-logo.webp",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}