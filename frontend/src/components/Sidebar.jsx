import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, User, ClipboardList } from "lucide-react";

const Sidebar = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    { icon: Home, label: "Home", route: "/dashboard" },
    {
      icon: ClipboardList,
      label: "Job Profiles",
      route: "/upcoming-companies",
    },
    { icon: User, label: "My Profile", route: "/view-profile" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <img
            src="https://cdn2.joinsuperset.com/students/static/media/superset-logo.23e4e1907b29549ceb57509d5f118ba1.svg"
            alt="Superset Logo"
            style={{
              width: 100, // Reduced from 150 to 100
              marginBottom: 20,
              objectFit: "contain", // Ensure logo maintains its aspect ratio
            }}
          />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Scorefolio
          </h1>
        </div>

        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.route;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
