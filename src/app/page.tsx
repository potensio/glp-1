import Link from "next/link";

export default function Home() {
  // Middleware handles authentication redirects automatically
  // This page should rarely be seen due to middleware redirects
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Link 
        href="/home" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
