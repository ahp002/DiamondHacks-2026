import SearchForm from './components/SearchForm';
import { fraunces } from './layout';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{backgroundColor: '#ffd480'}}>      
      <div className="sticker" style={{'--r': '15deg', top: '30px', right: '60px', fontSize: '40px', opacity: 0.35, animationDelay: '0s', textShadow: '0 0 3px white, 0 0 6px white'} as React.CSSProperties}>🍕</div>
      <div className="sticker" style={{'--r': '-10deg', top: '80px', left: '40px', fontSize: '28px', opacity: 0.25, animationDelay: '0.5s', textShadow: '0 0 3px white, 0 0 6px white'} as React.CSSProperties}>🍔</div>
      <div className="sticker" style={{'--r': '6deg', top: '100px', right: '500px', fontSize: '32px', opacity: 0.2, animationDelay: '1s', textShadow: '0 0 3px white, 0 0 6px white'} as React.CSSProperties}>🌮</div>
      <div className="sticker" style={{'--r': '-15deg', bottom: '80px', left: '80px', fontSize: '36px', opacity: 0.3, animationDelay: '1.5s', textShadow: '0 0 3px white, 0 0 6px white'} as React.CSSProperties}>🍣</div>
      <div className="sticker" style={{'--r': '10deg', bottom: '40px', right: '90px', fontSize: '44px', opacity: 0.2, animationDelay: '0.8s', textShadow: '0 0 3px white, 0 0 6px white'} as React.CSSProperties}>🍜</div>
      <div className="sticker" style={{'--r': '-15deg', bottom: '100px', right: '500px', fontSize: '44px', opacity: 0.2, animationDelay: '0.8s', textShadow: '0 0 3px white, 0 0 6px white'} as React.CSSProperties}>🍿</div>
      <div className="sticker" style={{'--r': '-5deg', top: '140px', left: '160px', fontSize: '24px', opacity: 0.2, animationDelay: '1.2s', textShadow: '0 0 3px white, 0 0 6px white'} as React.CSSProperties}>🥡</div>
      <div className="sticker" style={{'--r': '20deg', top: '60px', left: '500px', fontSize: '34px', opacity: 0.25, animationDelay: '0.3s', textShadow: '0 0 3px white, 0 0 6px white'} as React.CSSProperties}>🍟</div>
      <div className="sticker" style={{'--r': '-8deg', bottom: '400px', right: '200px', fontSize: '30px', opacity: 0.2, animationDelay: '0.9s', textShadow: '0 0 3px white, 0 0 6px white'} as React.CSSProperties}>🧆</div>
      <div className="sticker" style={{'--r': '12deg', bottom: '120px', left: '400px', fontSize: '38px', opacity: 0.25, animationDelay: '1.8s', textShadow: '0 0 3px white, 0 0 6px white'} as React.CSSProperties}>🍩</div>
      <div className="sticker" style={{'--r': '-18deg', top: '260px', right: '600px', fontSize: '28px', opacity: 0.2, animationDelay: '2.1s', textShadow: '0 0 3px white, 0 0 6px white'} as React.CSSProperties}>🥪</div>
      <div className="sticker" style={{'--r': '8deg', bottom: '300px', right: '360px', fontSize: '32px', opacity: 0.2, animationDelay: '1.6s', textShadow: '0 0 3px white, 0 0 6px white'} as React.CSSProperties}>🍦</div>
      <div className="sticker" style={{'--r': '-12deg', top: '220px', left: '600px', fontSize: '36px', opacity: 0.25, animationDelay: '2.4s', textShadow: '0 0 3px white, 0 0 6px white'} as React.CSSProperties}>🥤</div>
      
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