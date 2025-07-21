import Link from "next/link";
import NavBar from "./_components/navbar";

export default function NotFound() {
  return (
    <>
    <NavBar/>
    <div className="flex items-center justify-center w-full h-screen fixed inset-0 ">
      <div className="w-full max-w-md space-y-6 text-center px-4">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl animate-bounce">404</h1>
          <p className="text-gray-500">Looks like you&apos;ve ventured into the unknown digital realm.</p>
        </div>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
        >
          Return to website
        </Link>
      </div>
    </div>
          </>
  );
}