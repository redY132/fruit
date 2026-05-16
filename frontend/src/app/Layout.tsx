import React from 'react';
import { NavLink, Outlet } from 'react-router';
import { Home, Users, Settings, UserCircle, Sword } from 'lucide-react';

export function Layout() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      {/* Left-rail nav (64px) */}
      <nav className="w-16 h-full flex flex-col items-center py-6 border-r border-border shrink-0 bg-background z-50">
        {/* Logo Mark */}
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-8 text-white">
          <Sword size={24} className="rotate-45" />
        </div>

        {/* Icons */}
        <div className="flex flex-col gap-6 flex-1 w-full items-center">
          <NavItem to="/" icon={<Home size={24} />} />
          <NavItem to="/lobby" icon={<Users size={24} />} />
          <NavItem to="/settings" icon={<Settings size={24} />} />
        </div>

        {/* Profile Avatar pinned to bottom */}
        <div className="mt-auto">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isActive ? 'text-primary' : 'text-muted hover:text-white'
              }`
            }
          >
            <UserCircle size={32} />
          </NavLink>
        </div>
      </nav>

      {/* Main Area */}
      <main className="flex-1 relative overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon }: { to: string; icon: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
          isActive
            ? 'bg-secondary text-primary'
            : 'text-muted hover:text-white hover:bg-secondary/50'
        }`
      }
    >
      {icon}
    </NavLink>
  );
}
