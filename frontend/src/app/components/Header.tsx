import { Menu, X, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { SquirrelIcon } from './SquirrelIcon';

interface HeaderProps {
  userEmail: string;
  onLogout: () => void;
  onNavigateHome: () => void;
  showBackButton?: boolean;
}

export function Header({ userEmail, onLogout, onNavigateHome, showBackButton }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1 text-grinnell-red hover:text-grinnell-red-dark transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            <button onClick={onNavigateHome} className="flex items-center gap-2">
              <SquirrelIcon className="w-8 h-8 text-grinnell-red" />
              <span className="text-2xl font-bold text-gray-900">GrinnDorm</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-600">{userEmail}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-grinnell-red text-white rounded-lg hover:bg-grinnell-red-dark transition-colors"
            >
              Logout
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">{userEmail}</p>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-grinnell-red text-white rounded-lg hover:bg-grinnell-red-dark transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
