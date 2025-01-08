import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button,
  Container,
  Paper,
  TextField,
  IconButton,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  AccountCircle,
  School,
  Save,
  Cancel,
  ArrowBack,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    basic_details: {
      full_name: "",
      father_name: "",
      mother_name: "",
      date_of_birth: "",
      branch: "",
      email: "",
    },
    tenth_details: {
      school_location: "",
      board: "",
      year_of_passing: "",
      percentage: "",
      marksheet_url: "",
    },
    twelfth_details: {
      school_location: "",
      board: "",
      year_of_passing: "",
      percentage: "",
      marksheet_url: "",
    },
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      const studentId = localStorage.getItem("userId");
      if (!studentId) {
        setSnackbar({
          open: true,
          message: "User ID not found",
          severity: "error",
        });
        return;
      }

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/view-profile?student_id=${studentId}`
        );
        setFormData(response.data["Student Detail"][0]);
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Error fetching profile data",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const studentId = localStorage.getItem("userId");

    try {
      await axios.put(`http://127.0.0.1:8000/update-profile`, {
        student_id: studentId,
        ...formData,
      });
      setSnackbar({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      });
      setTimeout(() => navigate("/view-profile"), 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error updating profile",
        severity: "error",
      });
    }
  };

  const EducationSection = ({ title, section, details }) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="School Location"
              value={details.school_location}
              onChange={(e) =>
                handleChange(section, "school_location", e.target.value)
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Board"
              value={details.board}
              onChange={(e) => handleChange(section, "board", e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Year of Passing"
              value={details.year_of_passing}
              onChange={(e) =>
                handleChange(section, "year_of_passing", e.target.value)
              }
              margin="normal"
              type="number"
            />
            <TextField
              fullWidth
              label="Percentage"
              value={details.percentage}
              onChange={(e) =>
                handleChange(section, "percentage", e.target.value)
              }
              margin="normal"
              type="number"
              InputProps={{
                inputProps: { min: 0, max: 100 },
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h4">Edit Profile</Typography>
            <IconButton onClick={() => navigate("/view-profile")}>
              <ArrowBack />
            </IconButton>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
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
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={formData.basic_details.full_name}
                      onChange={(e) =>
                        handleChange(
                          "basic_details",
                          "full_name",
                          e.target.value
                        )
                      }
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Father's Name"
                      value={formData.basic_details.father_name}
                      onChange={(e) =>
                        handleChange(
                          "basic_details",
                          "father_name",
                          e.target.value
                        )
                      }
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mother's Name"
                      value={formData.basic_details.mother_name}
                      onChange={(e) =>
                        handleChange(
                          "basic_details",
                          "mother_name",
                          e.target.value
                        )
                      }
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Branch"
                      value={formData.basic_details.branch}
                      onChange={(e) =>
                        handleChange("basic_details", "branch", e.target.value)
                      }
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      value={formData.basic_details.date_of_birth}
                      onChange={(e) =>
                        handleChange(
                          "basic_details",
                          "date_of_birth",
                          e.target.value
                        )
                      }
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
              Education History
            </Typography>

            <EducationSection
              title="12th Grade Details"
              section="twelfth_details"
              details={formData.twelfth_details}
            />

            <EducationSection
              title="10th Grade Details"
              section="tenth_details"
              details={formData.tenth_details}
            />

            <Box
              sx={{
                mt: 4,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate("/view-profile")}
              >
                Cancel
              </Button>
              <Button variant="contained" startIcon={<Save />} type="submit">
                Save Changes
              </Button>
            </Box>
          </form>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
}

export default EditProfile;
