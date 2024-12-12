// frontend/app/layout.js
import './globals.css'; // Pastikan ini ada untuk mengimpor Tailwind
import Script from 'next/script';

export const metadata = {
  title: "Admin Dashboard",
  description: "Halaman login dan dashboard untuk admin",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <head>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js" strategy="beforeInteractive" />
      </head> */}
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
