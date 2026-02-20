"use client"
import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import  ItemsPage  from '@/pages/ItemsPage';
import  ProfilePage  from '@/pages/ProfilePage';
import  LoginPage  from '@/pages/LoginPage';
import  KhataPage  from '@/pages/KhataPage';

export default function App() {
  const [activePage, setActivePage] = useState('Khata');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Initialize dark mode from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      document.documentElement.classList.add('dark');
    } else if (savedDarkMode === null) {
      // Check system preference if no saved preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      }
    }
  }, []);

  // Check for existing login session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('user_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        // Verify session is still valid
        if (session.email && session.isAuthenticated) {
          setIsAuthenticated(true);
          setUserEmail(session.email);
          // Restore last active page if available
          if (session.activePage) {
            setActivePage(session.activePage);
          }
        }
      } catch (error) {
        // If session is corrupted, clear it
        localStorage.removeItem('user_session');
      }
    }
  }, []);

  const handleLogin = (email: string, password: string) => {
    // Get stored credentials
    const credentialsStr = localStorage.getItem('user_credentials');
    let validEmail = 'jamil@boxeltechnology.com';
    let validPassword = 'jamil786';

    if (credentialsStr) {
      const credentials = JSON.parse(credentialsStr);
      validEmail = credentials.email;
      validPassword = credentials.password;
    }

    // Validate credentials against stored values
    if (email === validEmail && password === validPassword) {
      setIsAuthenticated(true);
      setUserEmail(email);
      setActivePage('Khata');
      
      // Save session to localStorage for persistent login
      const session = {
        email: email,
        isAuthenticated: true,
        activePage: 'Khata',
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('user_session', JSON.stringify(session));
      
      return true; // Login successful
    }
    return false; // Login failed
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    setActivePage('Khata');
    
    // Clear session from localStorage
    localStorage.removeItem('user_session');
  };

  const handleNavigation = (page: string) => {
    if (page === 'Logout') {
      handleLogout();
    } else {
      setActivePage(page);
      // Close mobile sidebar when navigating
      setIsMobileSidebarOpen(false);
      
      // Update active page in session
      const savedSession = localStorage.getItem('user_session');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          session.activePage = page;
          localStorage.setItem('user_session', JSON.stringify(session));
        } catch (error) {
          // Ignore if session update fails
        }
      }
    }
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activePage) {
      case 'Items':
        return <ItemsPage />;
      case 'Profile':
        return <ProfilePage userEmail={userEmail} onLogout={handleLogout} />;
      case 'Khata':
        return <KhataPage />;
      default:
        return <KhataPage />;
    }
  };

  return (
    <div className="flex h-screen  bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      <Sidebar 
        onNavigate={handleNavigation} 
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col min-w-0">
        {renderContent()}
      </div>
      
      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden  fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-slate-200 dark:border-[#2d2d2d] z-20 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs text-slate-600 dark:text-slate-400">Menu</span>
          </button>
          
          <button
            onClick={() => handleNavigation('Khata')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              activePage === 'Khata' 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs">Khata</span>
          </button>
          
          <button
            onClick={() => handleNavigation('Items')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              activePage === 'Items' 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-xs">Items</span>
          </button>
          
          <button
            onClick={() => handleNavigation('Profile')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              activePage === 'Profile' 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}