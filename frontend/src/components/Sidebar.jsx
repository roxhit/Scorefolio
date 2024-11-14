// Sidebar.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, User, ClipboardList } from "lucide-react";

const Sidebar = ({ isDarkMode }) => {
  const navigate = useNavigate();

  const sidebarItems = [
    { icon: Home, label: "Home", active: true, route: "/dashboard" },
    { icon: ClipboardList, label: "Job Profiles", route: "/view-profile" },
    { icon: User, label: "My Profile", route: "/view-profile" },
  ];

  return (
    <div className="w-64 border-r border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-8">
        <div
          className={`w-8 h-8 ${
            isDarkMode ? "bg-blue-500" : "bg-blue-400"
          } rounded`}
        ></div>
        <h1 className="text-xl font-semibold">Scorefolio</h1>
      </div>

      <nav className="space-y-2">
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-200 ${
              item.active ? "bg-gray-200" : ""
            }`}
            onClick={() => navigate(item.route)}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
