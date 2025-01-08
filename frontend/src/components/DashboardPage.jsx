import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Bell, LogOut } from "lucide-react";
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
  CircularProgress,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import Sidebar from "./Sidebar";

function ProtectedPage() {
  const navigate = useNavigate();
  const [userFirstName, setUserFirstName] = useState("User");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(100);
  // Initialize notifications as an empty array
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    }

    // Only fetch notifications if userId exists
    if (userId) {
      fetchNotifications(userId);
    }
  }, [navigate]);

  const fetchNotifications = async (userId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/get-notifications/${userId}`
      );
      // Ensure notifications is always an array
      const notificationData = response.data.notifications || [];
      setNotifications(notificationData);
      setNotificationCount(notificationData.length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      setError("Failed to fetch notifications. Please try again later.");
      // Set empty array on error to prevent undefined
      setNotifications([]);
      setNotificationCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const openNotificationModal = async () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      await fetchNotifications(userId);
    }
    setIsNotificationModalOpen(true);
  };

  const closeNotificationModal = () => {
    setIsNotificationModalOpen(false);
  };

  const handleEditProfile = () => {
    navigate("/student-profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("usersdatatoken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <div
      className={`min-h-screen flex ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex justify-end items-center gap-4 mb-8">
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

        <Dialog
          open={isNotificationModalOpen}
          onClose={closeNotificationModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">Notifications</Typography>
          </DialogTitle>
          <DialogContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <CircularProgress />
              </div>
            ) : error ? (
              <Typography
                variant="body2"
                color="error"
                className="text-center py-4"
              >
                {error}
              </Typography>
            ) : notifications.length === 0 ? (
              <Typography variant="body2" className="text-center py-4">
                No notifications
              </Typography>
            ) : (
              <List>
                {notifications.map((notification, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={notification.title}
                      secondary={notification.message}
                      primaryTypographyProps={{
                        variant: "body1",
                        fontWeight: "bold",
                      }}
                      secondaryTypographyProps={{
                        variant: "body2",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.timestamp).toLocaleString()}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
        </Dialog>

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
  );
}

export default ProtectedPage;
