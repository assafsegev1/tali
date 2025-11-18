import React from 'react';
import { Microscope } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-emerald-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Microscope size={28} />
          <h1 className="text-xl font-bold tracking-wide">ביולוגיה זה אנחנו</h1>
        </div>
        <div className="text-sm font-medium bg-emerald-700 px-3 py-1 rounded-full">
          בגרות תשפ"ו
        </div>
      </div>
    </nav>
  );
};

export default Navbar;