import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-500 mr-2" />
            <span className="font-bold text-xl">Chatwoot Dashboard</span>
          </Link>
          <div className="flex items-center">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
              Dashboard
            </Link>
            <Link to="/settings" className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
              <Settings className="h-5 w-5 inline-block mr-1" />
              Settings
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;