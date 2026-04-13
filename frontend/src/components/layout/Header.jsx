import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';

export const Header = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const joinDate = user.member_since ? new Date(user.member_since).getFullYear() : '2023';

  return (
    <header className="h-[80px] bg-[var(--color-dark)] flex items-center justify-between px-8 shrink-0 border-b border-[var(--color-sidebar)]">
      {/* Left side: User context and Stats */}
      <div className="flex items-center gap-8">
        
        {/* User Identity */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--color-sidebar)] border border-gray-800 flex items-center justify-center overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold">{user.username.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold">{user.displayName || user.username}</h2>
            <span className="text-xs text-[var(--color-text-muted)] hover:text-white cursor-pointer">@{user.username}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-text-muted)]">Projects</span>
            <span className="font-semibold text-[var(--color-primary)]">3 Active</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-text-muted)]">Evals Given</span>
            <span className="font-semibold text-[var(--color-accent)]">12</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-text-muted)]">Rank</span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent)] bg-opacity-20 text-[white] text-xs font-bold ring-1 ring-[var(--color-accent)] select-none">
              {user.rank}
            </span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-text-muted)]">Member Since</span>
            <span className="font-semibold text-gray-300">{joinDate}</span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="text-[var(--color-text-muted)] hover:text-white transition-colors p-2 relative">
          <Bell size={20} />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-primary)] rounded-full border border-[var(--color-dark)]"></span>
        </button>
      </div>
    </header>
  );
};
