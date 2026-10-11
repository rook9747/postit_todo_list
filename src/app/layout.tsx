import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Post-It To Do List",
  description: "감성 미니멀 포스트잇 투두리스트 - Google Sheets 실시간 연동",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-[#F4F4F5] dark:bg-[#121214] text-[#18181B] dark:text-[#F4F4F5] transition-colors duration-200 antialiased selection:bg-amber-200 selection:text-stone-900">
        {children}
      </body>
    </html>
  );
}
