import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tabs, // Re-added Tabs import
  Tab, // Re-added Tab import
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Group as StudentIcon,
  Notifications as NotificationIcon,
  Logout as LogoutIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import axios from "axios";

const AdminDashboard = () => {
  // State variables
  const [students, setStudents] = useState([]);
  const [selectedView, setSelectedView] = useState("dashboard");
  const [notificationRecipient, setNotificationRecipient] = useState("all");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [counts, setCounts] = useState({
    total_students: 0,
    verified_students: 0,
    not_verified_students: 0,
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editStudentData, setEditStudentData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState(0);

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/get-all-students"
      );
      const data = response.data;

      // Ensure we're setting the correct counts
      setStudents(data.all_students);
      setCounts({
        total_students: data.total_students, // Total number of students
        verified_students: data.verified_students, // Number of verified students
        not_verified_students: data.not_verified_students, // Number of unverified students
      });
    } catch (error) {
      console.error("Failed to fetch students", error);
      alert("Error fetching student data");
    }
  };

  // Handle view student details
  const handleViewStudent = async (student) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/get-student-detail/${student.student_id}`
      );

      // Check if student details were successfully retrieved
      if (response.data && response.data.student_id) {
        setStudentDetails(response.data);
        setSelectedStudent(student);
        setIsViewDialogOpen(true);
      } else {
        alert("Unable to retrieve student details");
      }
    } catch (error) {
      console.error("Failed to fetch student details", error);
      alert("Error fetching student details");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit student
  const handleEditStudent = (student) => {
    setEditStudentData(student);
    setIsEditDialogOpen(true);
  };

  // Handle save student changes
  const handleSaveChanges = async () => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/verify-student/${editStudentData.student_id}`,
        {
          is_verified: editStudentData.is_verified,
          // You can add additional fields if needed for verification
          name: editStudentData.name,
          email: editStudentData.email,
        }
      );
      alert("Student verification updated successfully!");
      setIsEditDialogOpen(false);
      fetchStudents();
    } catch (error) {
      console.error("Failed to update student verification", error);
      alert("Failed to update student verification");
    }
  };

  // Handle send notification
  const handleSendNotification = async () => {
    if (!notificationMessage) {
      alert("Please enter a notification message");
      return;
    }

    try {
      let recipients =
        notificationRecipient === "all"
          ? students.map((student) => student.email)
          : [notificationRecipient];

      // Mock notification sending
      await Promise.all(
        recipients.map((recipient) =>
          console.log(
            `Notification sent to ${recipient}: ${notificationMessage}`
          )
        )
      );

      alert("Notification sent successfully!");
      setNotificationMessage("");
    } catch (error) {
      console.error("Failed to send notification", error);
      alert(" Failed to send notification");
    }
  };

  // Render dashboard view
  const renderDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Total Students</Typography>
            <Typography variant="h4">{counts.total_students}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Verified Students</Typography>
            <Typography variant="h4">{counts.verified_students}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Not Verified Students</Typography>
            <Typography variant="h4">{counts.not_verified_students}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render student details dialog
  const renderStudentDetailsDialog = () => {
    if (!studentDetails) return null;

    const handleTabChange = (event, newValue) => {
      setActiveDetailTab(newValue);
    };

    return (
      <Dialog
        open={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setStudentDetails(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Student Details - {studentDetails.name}
          <Tabs
            value={activeDetailTab}
            onChange={handleTabChange}
            sx={{ marginTop: 2 }}
          >
            <Tab label="Personal Info" />
            <Tab label="Academic Details" />
            <Tab label="Education History" />
          </Tabs>
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Personal Info Tab */}
              {activeDetailTab === 0 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body1">
                        <strong>Student ID:</strong> {studentDetails.student_id}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Full Name:</strong>{" "}
                        {studentDetails.basic_details?.full_name}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Father's Name:</strong>{" "}
                        {studentDetails.basic_details?.father_name}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Mother's Name:</strong>{" "}
                        {studentDetails.basic_details?.mother_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">
                        <strong>Email:</strong> {studentDetails.email}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Phone:</strong> {studentDetails.phone}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Date of Birth:</strong>{" "}
                        {studentDetails.basic_details?.date_of_birth}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Branch:</strong>{" "}
                        {studentDetails.basic_details?.branch}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Academic Details Tab */}
              {activeDetailTab === 1 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Semester Performance
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Semester</TableCell>
                          <TableCell>CGPA</TableCell>
                          <TableCell>Backlogs</TableCell>
                          <TableCell>Marksheet</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {studentDetails.semester_details?.map((semester) => (
                          <TableRow key={semester.semester}>
                            <TableCell>{semester.semester}</TableCell>
                            <TableCell>{semester.cgpa}</TableCell>
                            <TableCell>{semester.no_backlogs}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() =>
                                  window.open(semester.marksheet_url, "_blank")
                                }
                              >
                                View Mark sheet
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Education History Tab */}
              {activeDetailTab === 2 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Previous Education
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6">10th Standard</Typography>
                      <Typography variant="body1">
                        <strong>School:</strong>{" "}
                        {studentDetails.tenth_details?.school_location}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Board:</strong>{" "}
                        {studentDetails.tenth_details?.board}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Percentage:</strong>{" "}
                        {studentDetails.tenth_details?.percentage}%
                      </Typography>
                      <Typography variant="body1">
                        <strong>Year of Passing:</strong>{" "}
                        {studentDetails.tenth_details?.year_of_passing}
                      </Typography>
                      <Button
                        variant="outlined"
                        sx={{ mt: 1 }}
                        onClick={() =>
                          window.open(
                            studentDetails.tenth_details?.marksheet_url,
                            "_blank"
                          )
                        }
                      >
                        View 10th Marksheet
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6">12th Standard</Typography>
                      <Typography variant="body1">
                        <strong>School:</strong>{" "}
                        {studentDetails.twelfth_details?.school_location}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Board:</strong>{" "}
                        {studentDetails.twelfth_details?.board}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Percentage:</strong>{" "}
                        {studentDetails.twelfth_details?.percentage}%
                      </Typography>
                      <Typography variant="body1">
                        <strong>Year of Passing:</strong>{" "}
                        {studentDetails.twelfth_details?.year_of_passing}
                      </Typography>
                      <Button
                        variant="outlined"
                        sx={{ mt: 1 }}
                        onClick={() =>
                          window.open(
                            studentDetails.twelfth_details?.marksheet_url,
                            "_blank"
                          )
                        }
                      >
                        View 12th Marksheet
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Render students view
  const renderStudents = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Student List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Verification Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.student_id}>
                <TableCell>{student.student_id}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  {student.is_verified ? "Verified" : "Not Verified"}
                </TableCell>
                <TableCell align="right">
                  <Button
                    startIcon={<ViewIcon />}
                    color="primary"
                    onClick={() => handleViewStudent(student)}
                    sx={{ mr: 1 }}
                  >
                    View
                  </Button>
                  <Button
                    startIcon={<EditIcon />}
                    color="secondary"
                    onClick={() => handleEditStudent(student)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Render the student details dialog */}
      {renderStudentDetailsDialog()}

      {/* Edit Student Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <TextField
            label="Student ID"
            value={editStudentData.student_id || ""} // Corrected here
            disabled
            fullWidth
            margin="normal"
          />
          <TextField
            label="Name"
            value={editStudentData.name || ""}
            onChange={(e) =>
              setEditStudentData({ ...editStudentData, name: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={editStudentData.email || ""}
            onChange={(e) =>
              setEditStudentData({ ...editStudentData, email: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Verification Status</InputLabel>
            <Select
              value={editStudentData.is_verified ? "Verified" : "Not Verified"}
              onChange={(e) =>
                setEditStudentData({
                  ...editStudentData,
                  is_verified: e.target.value === "Verified",
                })
              }
            >
              <MenuItem value="Verified">Verified</MenuItem>
              <MenuItem value="Not Verified">Not Verified</MenuItem>
            </Select>
          </FormControl>
          {/* Add any additional fields you want to edit here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // Render notification section
  const renderNotificationSection = () => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Send Notification
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Recipient</InputLabel>
        <Select
          value={notificationRecipient}
          onChange={(e) => setNotificationRecipient(e.target.value)}
        >
          <MenuItem value="all">All Students</MenuItem>
          {students.map((student) => (
            <MenuItem key={student.student_id} value={student.email}>
              {student.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Notification Message"
        value={notificationMessage}
        onChange={(e) => setNotificationMessage(e.target.value)}
        fullWidth
        margin="normal"
        multiline
        rows={4}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSendNotification}
      >
        Send Notification
      </Button>
    </Box>
  );

  // Main render function
  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar>
          <Typography variant="h5" sx={{ fontWeight: "bold", ml: 2 }}>
            Scorefolio
          </Typography>
        </Toolbar>
        <List>
          <ListItem
            button
            selected={selectedView === "dashboard"}
            onClick={() => setSelectedView("dashboard")}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem
            button
            selected={selectedView === "students"}
            onClick={() => setSelectedView("students")}
          >
            <ListItemIcon>
              <StudentIcon />
            </ListItemIcon>
            <ListItemText primary="Students" />
          </ListItem>
          <ListItem
            button
            selected={selectedView === "notifications"}
            onClick={() => setSelectedView("notifications")}
          >
            <ListItemIcon>
              <NotificationIcon />
            </ListItemIcon>
            <ListItemText primary="Notifications" />
          </ListItem>
          <ListItem
            button
            onClick={() => alert("Logout functionality to be implemented")}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      <Container
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#f4f6f8",
          minHeight: "100vh",
        }}
      >
        {selectedView === "dashboard" && renderDashboard()}
        {selectedView === "students" && renderStudents()}
        {selectedView === "notifications" && renderNotificationSection()}
      </Container>
    </Box>
  );
};

export default AdminDashboard;
