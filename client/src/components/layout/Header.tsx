import { GolfBall } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b flex items-center px-6 bg-white">
      <div className="flex items-center gap-2">
        <GolfBall className="h-6 w-6 text-[#D92429]" />
        <h1 className="text-xl font-bold">Golf Shot Analyzer</h1>
      </div>
    </header>
  );
}