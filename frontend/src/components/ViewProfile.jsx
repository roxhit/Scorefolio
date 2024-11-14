import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid2,
  Avatar,
  Button,
  Container,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  AccountCircle,
  School,
  Person,
  CalendarToday,
  LocationOn,
  Description,
  Edit,
  DarkMode,
  LightMode,
} from "@mui/icons-material";
import axios from "axios";
import Sidebar from "./Sidebar";

function ViewProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      const studentId = localStorage.getItem("userId");

      if (!studentId) {
        console.error("Student ID not found in localStorage.");
        return;
      }

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/view-profile?student_id=${studentId}`
        );
        setProfileData(response.data["Student Detail"][0]);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!profileData) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="error">
          Failed to load profile data
        </Typography>
      </Box>
    );
  }

  const InfoItem = ({ icon, label, value }) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      {icon}
      <Box sx={{ ml: 2 }}>
        <Typography variant="caption" color="textSecondary">
          {label}
        </Typography>
        <Typography variant="body1">{value}</Typography>
      </Box>
    </Box>
  );

  const EducationCard = ({ title, details, icon }) => (
    <Card sx={{ mb: 3, position: "relative" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Grid2 container spacing={2}>
          <Grid2 item xs={12} sm={6}>
            <InfoItem
              icon={<LocationOn color="primary" />}
              label="School Location"
              value={details.school_location}
            />
            <InfoItem
              icon={<School color="primary" />}
              label="Board"
              value={details.board}
            />
          </Grid2>
          <Grid2 item xs={12} sm={6}>
            <InfoItem
              icon={<CalendarToday color="primary" />}
              label="Year of Passing"
              value={details.year_of_passing}
            />
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <Chip
                label={`${details.percentage}%`}
                color="primary"
                sx={{ mr: 2 }}
              />
              <Button
                variant="outlined"
                startIcon={<Description />}
                href={details.marksheet_url}
                target="_blank"
                size="small"
              >
                View Marksheet
              </Button>
            </Box>
          </Grid2>
        </Grid2>
      </CardContent>
    </Card>
  );

  return (
    <div
      className={`flex min-h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <Sidebar isDarkMode={isDarkMode} />
      <Container max Width="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid2 container spacing={3}>
            <Grid2 item xs={12} md={4} sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 150,
                  height: 150,
                  margin: "0 auto",
                  bgcolor: "primary.main",
                }}
              >
                <AccountCircle sx={{ fontSize: 120 }} />
              </Avatar>
              <Typography variant="h5" sx={{ mt: 2 }}>
                {profileData.basic_details.full_name}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {profileData.email}
              </Typography>
              <Button variant="contained" startIcon={<Edit />} sx={{ mt: 2 }}>
                Edit Profile
              </Button>
            </Grid2>
            <Grid2 item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid2 container spacing={2}>
                <Grid2 item xs={12} sm={6}>
                  <InfoItem
                    icon={<Person color="primary" />}
                    label="Father's Name"
                    value={profileData.basic_details.father_name}
                  />
                  <InfoItem
                    icon={<Person color="primary" />}
                    label="Mother's Name"
                    value={profileData.basic_details.mother_name}
                  />
                </Grid2>
                <Grid2 item xs={12} sm={6}>
                  <InfoItem
                    icon={<CalendarToday color="primary" />}
                    label="Date of Birth"
                    value={profileData.basic_details.date_of_birth}
                  />
                  <InfoItem
                    icon={<School color="primary" />}
                    label="Branch"
                    value={profileData.basic_details.branch}
                  />
                </Grid2>
              </Grid2>
            </Grid2>
          </Grid2>
        </Paper>

        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Education History
        </Typography>

        <EducationCard
          title="12th Grade Details"
          details={profileData.twelfth_details}
          icon={<School color="primary" sx={{ fontSize: 30 }} />}
        />

        <EducationCard
          title="10th Grade Details"
          details={profileData.tenth_details}
          icon={<School color="primary" sx={{ fontSize: 30 }} />}
        />

        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Semester Performance
        </Typography>
        <Grid2 container spacing={2}>
          {profileData.semester_details.map((semester, index) => (
            <Grid2 item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Semester {semester.semester}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      CGPA
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {semester.cgpa}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Backlogs
                    </Typography>
                    <Chip
                      label={semester.no_backlogs}
                      color={semester.no_backlogs === 0 ? "success" : "error"}
                      size="small"
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<Description />}
                    href={semester.marksheet_url}
                    target="_blank"
                    fullWidth
                    size="small"
                  >
                    View Marksheet
                  </Button>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Container>
    </div>
  );
}

export default ViewProfile;
