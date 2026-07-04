export const metadata = {
  title: "AI Value & ROI Optimizer",
  description: "SaaS AI Value & ROI optimization dashboard (demo)",
};

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 min-h-screen">{children}</body>
    </html>
  );
}
