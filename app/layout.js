import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

export const metadata = {
  title: "TPOM - The Pre-Owned Market",
  description: "Cars, Bikes & Home Appliances",
  icons: {
    icon: "/tpom-logo.png",
    shortcut: "/tpom-logo.png",
    apple: "/tpom-logo.png",
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