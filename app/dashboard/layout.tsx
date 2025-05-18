import NavBar from "../_components/navbar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      <div className="px-16">{children}</div>
    </>
  );
}
