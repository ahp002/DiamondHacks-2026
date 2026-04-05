import SearchForm from './components/SearchForm';
import { fraunces } from './layout';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{backgroundColor: '#ffd480'}}>      
      <header className=" px-8 py-4 flex items-center w-full" style={{backgroundColor: '#ffd480'}}>
        <span className="text-[15px] font-medium tracking-[0.01em]">
          <span className="text-black font-bold">Broke</span><span className="text-black font-medium">Bites</span>
        </span>
      </header>
      <main className="flex-1 ml-5 max-w-[800px] w-full mx-auto px-6 pt-48 flex flex-col" style={{backgroundColor: '#ffd480'}}>
        <h1 className={`${fraunces.className} text-[50px] font-normal leading-snug mb-2`}>
          Why pay more to eat?
        </h1>
        <p className="text-[25px] text-[#b36200] mb-5">
          One Search. Three apps. Best Prices.
        </p>
        <SearchForm />
      </main>
      <footer className="px-8 py-4 text-xs text-[#b36200] w-full text-center" style={{backgroundColor: '#ffd480'}}>
        BrokeBites &mdash; not affiliated with GrubHub, DoorDash, or Uber Eats.
      </footer>
    </div>
  );
}