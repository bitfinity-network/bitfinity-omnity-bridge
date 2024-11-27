import "./globals.css";

export const metadata = {
  title: "Bitfinity Bridge",
  description: "Bridge tokens from Internet Computer to Bitfinity EVM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
