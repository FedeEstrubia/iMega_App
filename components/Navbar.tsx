
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Profile } from '../types';
import { Repository } from '../lib/repository';

interface NavbarProps {
  user: Profile | null;
  isAdmin: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, isAdmin, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await Repository.signOut();
    onLogout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full apple-blur bg-white/70 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold tracking-tight text-black flex items-center">
              <span className="mr-2"></span> iStore
            </Link>
            <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
              <Link to="/" className="hover:text-black transition-colors">Catálogo</Link>
              <Link to="/benefits" className="hover:text-black transition-colors">Beneficios</Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Panel Admin
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/account" className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all">
                  <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full">Lvl {user.level}</span>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.full_name || user.email}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-xs font-medium text-gray-500 hover:text-black"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="text-sm font-medium bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition-all"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
