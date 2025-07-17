import NavBar from "../_components/navbar";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      <div className="px-6">  <NuqsAdapter>{children}</NuqsAdapter></div>
    </>
  );
}
