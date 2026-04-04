import SearchForm from './components/SearchForm';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#1c1c1a] text-gray-900 dark:text-[#f0efe9]">
      <header className="border-b border-black/10 dark:border-white/10 px-8 py-4 flex items-center">
        <span className="text-[15px] font-medium tracking-[0.01em]">
          cheapr<span className="text-gray-400 dark:text-gray-500 font-normal">.delivery</span>
        </span>
      </header>

      <main className="flex-1 max-w-[720px] w-full mx-auto px-6 py-12">
        <h1 className="text-[28px] font-medium leading-snug mb-2">
          Find the lowest delivery price
        </h1>
        <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-8">
          Agents search multiple apps simultaneously and surface the best deal.
        </p>
        <SearchForm />
      </main>

      <footer className="border-t border-black/10 dark:border-white/10 px-8 py-4 text-xs text-gray-400 dark:text-gray-600">
        cheapr.delivery &mdash; not affiliated with GrubHub, DoorDash, or Uber Eats.
      </footer>
    </div>
  );
}
