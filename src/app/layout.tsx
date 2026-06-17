import "./globals.css";

// Pass-through root: the localized tree (src/app/[locale]) and the admin tree
// (src/app/admin) each render their own <html>/<body>. Global styles are
// imported here so they apply to both.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
