// Header.tsx
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { useState } from "react";
import { constants } from '../../common/constants';

export default function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: "/", label: "Rough Note", icon: "💡" },
    { path: "/expenses", label: "Expenses Manager", icon: "💰" },
  ];

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/home" || location.pathname === "/index-page";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-white">
                <rect x="4" y="4" width="16" height="16" fill="currentColor"/>
                <rect x="8" y="8" width="8" height="8" fill="white"/>
              </svg>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
          </motion.div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            {constants.name}
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 group ${
                isActivePath(item.path)
                  ? "text-indigo-700 bg-indigo-50 shadow-sm"
                  : "text-slate-600 hover:text-indigo-700 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </span>
              {isActivePath(item.path) && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle mobile menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className={`block w-5 h-0.5 bg-slate-600 transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
            }`}></span>
            <span className={`block w-5 h-0.5 bg-slate-600 transition-all duration-300 ${
              isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}></span>
            <span className={`block w-5 h-0.5 bg-slate-600 transition-all duration-300 ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
            }`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <motion.div
        initial={false}
        animate={{
          height: isMobileMenuOpen ? "auto" : 0,
          opacity: isMobileMenuOpen ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden overflow-hidden bg-white/95 backdrop-blur-md border-t border-slate-200/60"
      >
        <nav className="px-4 py-4 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActivePath(item.path)
                  ? "text-indigo-700 bg-indigo-50 shadow-sm"
                  : "text-slate-600 hover:text-indigo-700 hover:bg-slate-50"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
              {isActivePath(item.path) && (
                <div className="ml-auto w-2 h-2 bg-indigo-600 rounded-full"></div>
              )}
            </Link>
          ))}
        </nav>
      </motion.div>
    </header>
  );
}