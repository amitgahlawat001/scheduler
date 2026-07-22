import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex justify-between items-center px-6 py-3 bg-gradient-to-r from-brand-dark via-brand to-brand-light shadow-md">
      <Link to="/" className="flex items-center gap-2 font-bold text-white no-underline">
        <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
          📅
        </span>
        Scheduler
      </Link>
    </header>
  );
}
