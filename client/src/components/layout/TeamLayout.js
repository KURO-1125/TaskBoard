import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import TeamSidebar from './TeamSidebar';

const TeamLayout = () => {
  return (
    <div className="min-h-screen bg-black-50 dark:bg-black-950 bg-pattern-grid">
      <Navbar />
      <div className="flex">
        <TeamSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeamLayout; 