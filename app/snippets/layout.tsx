import NavBar from "../_components/navbar";




export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <NavBar/>
    <div className="px-6">
    {children}
    </div>
    </>
  );
}
