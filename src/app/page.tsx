import { FeedsTable } from "@/components/FeedsTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <main className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
            API3 Price Feeds
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            View all available price feeds on Base with their current data
          </p>
        </div>
        <FeedsTable />
      </main>
    </div>
  );
}
