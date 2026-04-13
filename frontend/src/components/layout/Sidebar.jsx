import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Map, User, LayoutGrid, Package, ShieldCheck, LogOut } from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/cursus', icon: Map, label: 'Cursus' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/showcase', icon: LayoutGrid, label: 'Showcase' },
    { to: '/requests', icon: Package, label: 'Requests' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', icon: ShieldCheck, label: 'Admin Space' });
  }

  return (
    <aside className="w-[185px] bg-[var(--color-sidebar)] h-full flex flex-col border-r-4 border-r-[var(--color-primary)]">
      <div className="p-6">
        <img 
          src="/logo.png" 
          alt="42 Robotics" 
          className="w-full h-auto object-contain"
        />
      </div>
      
      <nav className="flex-1 mt-6">
        <ul className="space-y-4">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink 
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-6 py-2 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-[var(--color-text-muted)] hover:text-white'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6">
        <button 
          onClick={logout}
          className="flex items-center gap-3 text-[var(--color-text-muted)] hover:text-red-400 transition-colors duration-200 w-full text-left"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
};
