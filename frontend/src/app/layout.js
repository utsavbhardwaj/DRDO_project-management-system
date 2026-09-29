import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "SQRMT — DRDO Audit Management System",
  description: "SSPL Quality Reliability Monitoring and Tracking for DRDO project tracking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col bg-[#dce6f0]">
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="bg-[#e8eef4] border-t border-gray-300 py-4 text-center">
            <p className="text-xs text-gray-500">
              © 2026 SSPL Quality Reliability Monitoring and Tracking SSPL. All rights reserved.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
