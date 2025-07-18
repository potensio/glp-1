import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
      <Link href="/home">
        <button className="px-6 py-3 rounded bg-blue-600 text-white font-semibold text-lg shadow hover:bg-blue-700 transition">
          Go to Home
        </button>
      </Link>
    </div>
  );
}
