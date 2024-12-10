import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Bell, Sun, Moon, LogOut } from "lucide-react";
import axios from "axios";
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
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import Sidebar from "./Sidebar";

function ProtectedPage() {
  const navigate = useNavigate();
  const [userFirstName, setUserFirstName] = useState("User");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(100);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("usersdatatoken");
    const userId = localStorage.getItem("userId");

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

    // Fetch notifications if userId exists
    if (userId) {
      fetchNotifications(userId);
    }
  }, [navigate]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleEditProfile = () => {
    navigate("/student-profile");
  };

  const fetchNotifications = async (userId) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/get-notifications/${userId}`
      );
      setNotifications(response.data.notifications);
      setNotificationCount(response.data.notifications.length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleLogout = () => {
    // Clear all items from localStorage
    localStorage.removeItem("usersdatatoken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    // Redirect to login page
    navigate("/");
  };

  const openNotificationModal = () => {
    setIsNotificationModalOpen(true);
  };

  const closeNotificationModal = () => {
    setIsNotificationModalOpen(false);
  };

  return (
    <div
      className={`min-h-screen flex ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        <Paper
          elevation={0}
          square
          className="fixed top-0 left-0 right-0 z-10"
          sx={{
            backgroundColor: isDarkMode ? "#1e1e1e" : "#f4f6f8",
            py: 2,
            px: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "rgba(0, 0, 0, 0.05) 0px 1px 2px",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: isDarkMode ? "white" : "text.primary",
            }}
          >
            Scorefolio
          </Typography>

          <div className="flex items-center gap-4">
            <Tooltip title="Settings">
              <IconButton>
                <Settings
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                />
              </IconButton>
            </Tooltip>

            <div
              className="relative cursor-pointer"
              onClick={openNotificationModal}
            >
              <Bell
                className={`w-5 h-5 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              />
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </div>

            <Tooltip title="Logout">
              <IconButton onClick={handleLogout}>
                <LogOut
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                />
              </IconButton>
            </Tooltip>
          </div>
        </Paper>

        <div className="container mx-auto px-4 pt-20 pb-8">
          <div className="flex items-center gap-6 mb-8">
            <Avatar
              alt={userFirstName}
              src="/api/placeholder/64/64"
              sx={{
                width: 80,
                height: 80,
                border: isDarkMode ? "3px solid #333" : "3px solid #e0e0e0",
              }}
            />
            <div>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: isDarkMode ? "white" : "text.primary",
                  mb: 1,
                }}
              >
                Welcome, {userFirstName}!
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Dashboard Overview
              </Typography>
            </div>
          </div>

          {/* Profile Completion Card */}
          <Card
            sx={{
              backgroundColor: isDarkMode ? "#2a2a2a" : "#ffffff",
              boxShadow: isDarkMode
                ? "none"
                : "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
              borderRadius: 3,
              p: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: isDarkMode ? "white" : "text.primary",
                }}
              >
                Profile Completion
              </Typography>
              <LinearProgress
                variant="determinate"
                value={profileCompletion}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: isDarkMode ? "#3a3a3a" : "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#3f51b5",
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  color: isDarkMode ? "text.secondary" : "text.primary",
                }}
              >
                {profileCompletion}% completed
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                startIcon={<Edit />}
                onClick={handleEditProfile}
                sx={{
                  backgroundColor: "#3f51b5",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#303f9f",
                  },
                }}
              >
                Edit Profile
              </Button>
            </CardActions>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProtectedPage;
