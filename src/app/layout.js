import "./globals.css";
import Banner from "@/components/Banner";

export const metadata = {
  title: "Rethis Tools",
  description: "Your personal grocery + tools assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <Banner />
        <main>{children}</main>
      </body>
    </html>
  );
}
