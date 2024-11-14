import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Settings, Bell, Sun, Moon, LogOut } from "lucide-react";
import {
  Avatar,
  Button,
  LinearProgress,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Edit } from "@mui/icons-material";

function ProtectedPage() {
  const navigate = useNavigate();
  const [userFirstName, setUserFirstName] = useState("User");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(100);

  useEffect(() => {
    const token = localStorage.getItem("usersdatatoken");
    if (!token) {
      navigate("/");
      return;
    }

    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserFirstName(storedName.split(" ")[0]);
    } else {
      setUserFirstName("User");
    }
  }, [navigate]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleEditProfile = () => {
    navigate("/student-profile");
  };

  const handleLogout = () => {
    // Clear all items from localStorage
    localStorage.removeItem("usersdatatoken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    // Redirect to login page
    navigate("/");
  };

  return (
    <div
      className={`flex min-h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <Sidebar isDarkMode={isDarkMode} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex items-center gap-4 mb-8">
          {/* Profile Avatar */}
          <Avatar
            alt={userFirstName}
            src="/api/placeholder/64/64"
            sx={{ width: 64, height: 64 }}
          />
          <Typography variant="h4" className="font-semibold">
            Welcome, {userFirstName}!
          </Typography>
        </div>

        {/* Profile Completion Card */}
        <Card
          className="mb-8"
          style={{
            backgroundColor: isDarkMode ? "#424242" : "#fafafa",
            color: isDarkMode ? "#f1f1f1" : "#333",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile Completion
            </Typography>
            <LinearProgress
              variant="determinate"
              value={profileCompletion}
              style={{ height: 10, borderRadius: 5 }}
            />
            <Typography
              variant="body2"
              color="textSecondary"
              style={{ marginTop: 8 }}
            >
              {profileCompletion}% completed
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              startIcon={<Edit />}
              onClick={handleEditProfile}
              style={{
                backgroundColor: "#3f51b5",
                color: "#ffffff",
              }}
            >
              Edit Profile
            </Button>
          </CardActions>
        </Card>

        {/* Additional Content Here */}
      </div>

      {/* Top Navigation */}
      <div className="fixed top-0 right-0 p-4 flex items-center gap-4">
        <Settings className="w-5 h-5" />
        <div className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-4 h-4 flex items-center justify-center">
            8
          </span>
        </div>
        <Tooltip title="Logout">
          <IconButton
            onClick={handleLogout}
            style={{
              color: isDarkMode ? "#ffffff" : "#333333",
            }}
          >
            <LogOut className="w-5 h-5" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Light/Dark Mode Toggle */}
      <div className="fixed bottom-4 left-4">
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2 p-2 border rounded-lg shadow-md transition-colors duration-300"
          style={{
            backgroundColor: isDarkMode ? "#333" : "#f1f1f1",
            color: isDarkMode ? "#f1f1f1" : "#333",
          }}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>
    </div>
  );
}

export default ProtectedPage;
