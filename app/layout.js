import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

export const metadata = {
  title: "TPOM - The Pre-Owned Market",
  description: "Cars, Bikes & Home Appliances",
  icons: {
    icon: "/TPOM-LOGO-1.png",
    shortcut: "/TPOM-LOGO-1.png",
    apple: "/TPOM-LOGO-1.png",
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