import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import PwaBootstrap from "@/components/pwa/PwaBootstrap";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tepup — Kiến thức công dân thực dụng bằng tiếng Việt",
  description:
    "Học những điều cơ bản về thuế, tư duy, và quyền số — miễn phí, ẩn danh, bằng tiếng Việt.",
  applicationName: "Tepup",
  // Href này được PwaBootstrap ghi đè ở phía trình duyệt để kèm theo tiến độ học.
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Tepup",
    // Thanh trạng thái trong suốt để nội dung chạy lên sát mép trên; các thanh
    // dính đã tự chừa vùng an toàn qua tiện ích pt-safe/pb-safe.
    statusBarStyle: "default",
  },
  other: {
    // Next.js chỉ phát thẻ chuẩn mới `mobile-web-app-capable`. iOS trước 16.4 chưa
    // đọc `display` trong manifest nên vẫn cần thẻ cũ của Apple, nếu không app đã
    // cài sẽ mở ra kèm thanh địa chỉ Safari — đúng thứ cần tránh.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Cần cho env(safe-area-inset-*) — thiếu nó thì tai thỏ và thanh home
  // của iPhone sẽ cắt mất nội dung khi chạy toàn màn hình.
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Chuyển đến nội dung chính
        </a>
        <PwaBootstrap />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
