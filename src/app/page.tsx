import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-black to-gray-700 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-30 animate-pulse"></div>
      <div className="relative z-10 text-center mb-10">
        <h1 className="text-6xl font-extrabold mb-4">Elevate Your Productivity</h1>
        <p className="text-xl mb-6 max-w-lg mx-auto">
          Integrate Notion and Todoist effortlessly.
        </p>
      </div>

      <div className="flex space-x-4 relative z-10">
        <Link href="/todoist" passHref>
          <button className="px-8 py-4 bg-white text-blue-600 rounded-lg shadow-lg hover:bg-gray-100 transition transform hover:scale-105">
            Go to Todoist
          </button>
        </Link>
        <Link href="/notion" passHref>
          <button className="px-8 py-4 bg-white text-blue-600 rounded-lg shadow-lg hover:bg-gray-100 transition transform hover:scale-105">
            Go to Notion
          </button>
        </Link>
      </div>

      <footer className="mt-10 text-sm relative z-10">
        <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
}
