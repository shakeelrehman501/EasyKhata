
import React, { useState } from 'react';
import { 
  PanelLeft, 
  BookOpen,
  Folder,
  User,
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type MenuItem = {
  name: string;
  icon: React.ElementType;
};

type MenuHeader = {
  header: string;
};

type MenuItemOrHeader = MenuItem | MenuHeader;

// Flat menu structure - no subItems, no nesting
const menuStructure: MenuItemOrHeader[] = [
  { name: 'Khata', icon: BookOpen },
  { name: 'Items', icon: Folder },
  { header: 'Settings' },
  { name: 'Profile', icon: User },
  { name: 'Logout', icon: LogOut },
];

interface SidebarProps {
  onNavigate?: (page: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ onNavigate, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const [activeItem, setActiveItem] = useState<string>('Khata');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);

  // Load user profile from localStorage
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      firstName: 'Jamil',
      lastName: 'Ahmed',
      email: 'jamil@boxeltechnology.com'
    };
  });

  // Listen for profile updates
  React.useEffect(() => {
    const handleProfileUpdate = () => {
      const saved = localStorage.getItem('user_profile');
      if (saved) {
        setUserProfile(JSON.parse(saved));
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  // Get user initials
  const getInitials = () => {
    return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`;
  };

  // Get full name
  const getFullName = () => {
    return `${userProfile.firstName} ${userProfile.lastName}`;
  };

  const handleItemClick = (name: string) => {
    setActiveItem(name);
    onNavigate?.(name);
    // Close hover popup on click
    setHoveredItem(null);
    setPopupPosition(null);
    // Close mobile menu if open
    onMobileClose?.();
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, itemName: string) => {
    if (!isCollapsed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupPosition({
      top: rect.top,
      left: rect.right + 12
    });
    setHoveredItem(itemName);
  };

  const handleMouseLeave = () => {
    if (!isCollapsed) return;
    setHoveredItem(null);
    setPopupPosition(null);
  };

  return (
    <>
      {/* Custom hover scrollbar CSS */}
      <style>{`
        .sidebar-scrollable {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .sidebar-scrollable:hover {
          scrollbar-color: #94a3b8 transparent;
        }
        .dark .sidebar-scrollable:hover {
          scrollbar-color: #52525b transparent;
        }
        .sidebar-scrollable::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scrollable::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scrollable::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 3px;
        }
        .sidebar-scrollable:hover::-webkit-scrollbar-thumb {
          background-color: #94a3b8;
        }
        .dark .sidebar-scrollable:hover::-webkit-scrollbar-thumb {
          background-color: #52525b;
        }
        
        /* Hide scrollbar in collapsed mode but keep scrolling */
        .sidebar-collapsed-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .sidebar-collapsed-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Fixed position hover tooltip - simple text only */}
      {isCollapsed && hoveredItem && popupPosition && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
          className="fixed bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-slate-200 dark:border-zinc-700 py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap pointer-events-none"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
            zIndex: 9999
          }}
        >
          {hoveredItem}
        </motion.div>
      )}
      
      <motion.div 
        initial={false}
        animate={{ 
          width: isCollapsed ? '80px' : '288px',
          x: 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "bg-white dark:bg-[#1a1a1a] h-full flex flex-col font-sans border-r border-slate-200 dark:border-[#2d2d2d] shadow-sm text-slate-600 dark:text-[#9ca3af] shrink-0 relative",
          // Desktop: show normally, Mobile: fixed overlay
          "lg:relative lg:z-40",
          "max-lg:fixed max-lg:left-0 max-lg:top-0 max-lg:bottom-0 max-lg:z-50 max-lg:w-[280px]",
          !isMobileOpen && "max-lg:-translate-x-full max-lg:hidden"
        )}
      >
        {/* Logo Area */}
        <div className={cn(
          "flex items-center transition-all",
          isCollapsed ? "justify-center p-4" : "justify-between p-6 pb-2 gap-3"
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-blue-200 dark:shadow-blue-900 shadow-lg shrink-0">
                B
              </div>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold text-slate-800 dark:text-slate-100 text-lg tracking-tight whitespace-nowrap"
              >
                Bhatti Mobile Shop
              </motion.span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div 
          className={cn(
            "flex-1 overflow-y-auto px-4 py-4 sidebar-scrollable",
            isCollapsed && "sidebar-collapsed-scroll"
          )}
        >
          {menuStructure.map((item, index) => {
            // Handle section headers
            if ('header' in item) {
              return (
                <div key={index} className={cn("px-4 mt-6 mb-2", isCollapsed && "px-0")}>
                  {!isCollapsed && (
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {item.header}
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="h-px bg-slate-200 dark:bg-slate-700 mx-auto w-8" />
                  )}
                </div>
              );
            }

            // Handle menu items - simple clickable buttons
            const menuItem = item as MenuItem;
            const isActive = activeItem === menuItem.name;

            return (
              <div 
                key={menuItem.name} 
                className="mb-1 relative"
                onMouseEnter={(e) => handleMouseEnter(e, menuItem.name)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => handleItemClick(menuItem.name)}
                  className={cn(
                    "w-full flex items-center rounded-xl transition-all duration-200 group relative",
                    isCollapsed ? "px-2 py-3 justify-center" : "px-4 py-3 gap-3",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold shadow-sm ring-1 ring-blue-100 dark:ring-blue-800/50" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <menuItem.icon 
                    size={20} 
                    className={cn(
                      "transition-colors shrink-0",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )} 
                  />
                  {!isCollapsed && <span>{menuItem.name}</span>}
                </button>
              </div>
            );
          })}
        </div>

        <div className={cn("p-4 border-t border-slate-100 dark:border-slate-700 mx-4 mb-4", isCollapsed && "mx-2")}>
          <button 
            onClick={() => {
              setActiveItem('Profile');
              onNavigate?.('Profile');
            }}
            className={cn(
              "flex items-center w-full p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors",
              isCollapsed ? "justify-center gap-0" : "gap-3"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-md shrink-0">
              {getInitials()}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{getFullName()}</span>
              </div>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}