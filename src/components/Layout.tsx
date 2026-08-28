import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-3 sm:p-6">{children}</main>
      </div>
    </div>
  );
};
