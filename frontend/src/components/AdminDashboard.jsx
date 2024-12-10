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
  Tabs,
  Tab,
  Avatar,
  ListItemAvatar,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Group as StudentIcon,
  Notifications as NotificationIcon,
  Logout as LogoutIcon,
  Visibility as ViewIcon,
  FileDownload as ExportIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
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

  const [filterName, setFilterName] = useState("");
  const [filterMinCGPA, setFilterMinCGPA] = useState("");
  const [filterVerificationStatus, setFilterVerificationStatus] =
    useState("all");

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
        total_students: data.total_students,
        verified_students: data.verified_students,
        not_verified_students: data.not_verified_students,
      });
    } catch (error) {
      console.error("Failed to fetch students", error);
      alert("Error fetching student data");
    }
  };

  const exportVerifiedStudentDetails = async () => {
    try {
      setIsLoading(true);

      // Filter only verified students
      const verifiedStudentIds = students
        .filter((student) => student.is_verified)
        .map((student) => student.student_id);

      // Fetch details for each verified student
      const verifiedStudentDetails = await Promise.all(
        verifiedStudentIds.map(async (studentId) => {
          try {
            const response = await axios.get(
              `http://127.0.0.1:8000/get-student-detail/${studentId}`
            );
            return response.data;
          } catch (error) {
            console.error(
              `Failed to fetch details for student ${studentId}`,
              error
            );
            return null;
          }
        })
      );

      // Remove any null responses
      const validVerifiedStudents = verifiedStudentDetails.filter(
        (detail) => detail !== null
      );

      const exportData = validVerifiedStudents.map((student) => ({
        "Student ID": student.student_id,
        Name: student.name,
        Email: student.email,
        Phone: student.phone,
        Branch: student.basic_details?.branch,
        "Father Name": student.basic_details?.father_name,
        "Mother Name": student.basic_details?.mother_name,
        "Date of Birth": student.basic_details?.date_of_birth,
        "10th School": student.tenth_details?.school_location,
        "10th Board": student.tenth_details?.board,
        "10th Percentage": student.tenth_details?.percentage,
        "10th Passing Year": student.tenth_details?.year_of_passing,
        "12th School": student.twelfth_details?.school_location,
        "12th Board": student.twelfth_details?.board,
        "12th Percentage": student.twelfth_details?.percentage,
        "12th Passing Year": student.twelfth_details?.year_of_pasing,
        "Total Semesters": student.semester_details?.length || 0,
        "Avg CGPA": student.semester_details
          ? (
              student.semester_details.reduce(
                (sum, sem) => sum + parseFloat(sem.cgpa),
                0
              ) / student.semester_details.length
            ).toFixed(2)
          : "N/A",
        "Total Backlogs": student.semester_details
          ? student.semester_details.reduce(
              (sum, sem) => sum + parseInt(sem.no_backlogs),
              0
            )
          : "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Verified Students");

      XLSX.writeFile(workbook, "Verified_Students.xlsx");
    } catch (error) {
      console.error("Error exporting verified student details", error);
      alert("Error exporting data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewStudent = async (student) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:8000/get-student-detail/${student.student_id}`
      );
      setStudentDetails(response.data);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch student details", error);
      alert("Failed to fetch student details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    setEditStudentData(student);
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/verify-student/${editStudentData.student_id}`,
        {
          is_verified: editStudentData.is_verified,
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

  const handleSendNotification = async () => {
    if (!notificationMessage) {
      alert("Please enter a notification message");
      return;
    }

    try {
      const recipient =
        notificationRecipient === "all"
          ? "all"
          : students.find((student) => student.email === notificationRecipient)
              ?.student_id;

      if (!recipient) {
        alert("Invalid recipient selected");
        return;
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/send-notification",
        {
          message: notificationMessage,
          student_id: recipient,
        }
      );

      alert(response.data.message);
      setNotificationMessage("");
      setNotificationRecipient("all");
    } catch (error) {
      console.error("Failed to send notification", error);
      alert(error.response?.data?.detail || "Failed to send notification");
    }
  };

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

  const renderStudents = () => {
    const filteredStudents = students.filter((student) => {
      const nameMatch = student.name
        .toLowerCase()
        .includes(filterName.toLowerCase());
      const cgpaMatch =
        filterMinCGPA === "" ||
        (student.semester_details &&
          parseFloat(
            student.semester_details[student.semester_details.length - 1].cgpa
          ) >= parseFloat(filterMinCGPA));
      const verificationMatch =
        filterVerificationStatus === "all" ||
        (filterVerificationStatus === "verified" && student.is_verified) ||
        (filterVerificationStatus === "not_verified" && !student.is_verified);
      return nameMatch && cgpaMatch && verificationMatch;
    });

    return (
      <Box>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Filter by Name"
            variant="outlined"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Minimum CGPA"
            type="number"
            variant="outlined"
            value={filterMinCGPA}
            onChange={(e) => setFilterMinCGPA(e.target.value)}
            sx={{ width: 150 }}
          />
          <FormControl variant="outlined" sx={{ width: 200 }}>
            <InputLabel>Verification Status</InputLabel>
            <Select
              value={filterVerificationStatus}
              onChange={(e) => setFilterVerificationStatus(e.target.value)}
              label="Verification Status"
            >
              <MenuItem value="all">All Students</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="not_verified">Not Verified</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ExportIcon />}
            onClick={exportVerifiedStudentDetails}
            disabled={isLoading}
          >
            {isLoading ? "Exporting..." : "Export Verified Students"}
          </Button>
        </Box>

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
              {filteredStudents.map((student) => (
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

        {renderStudentDetailsDialog()}

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
              value={editStudentData.student_id || ""}
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
                setEditStudentData({
                  ...editStudentData,
                  email: e.target.value,
                })
              }
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Verification Status</InputLabel>
              <Select
                value={
                  editStudentData.is_verified ? "Verified" : "Not Verified"
                }
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
  };

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

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 280,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
            py: 3,
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          }}
        >
          <img
            src="https://cdn2.joinsuperset.com/students/static/media/superset-logo.23e4e1907b29549ceb57509d5f118ba1.svg"
            alt="Scorefolio Logo"
            style={{
              maxHeight: 50,
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </Toolbar>
        <List>
          {[
            {
              text: "Dashboard",
              icon: <DashboardIcon />,
              view: "dashboard",
            },
            {
              text: "Students",
              icon: <StudentIcon />,
              view: "students",
            },
            {
              text: "Notifications",
              icon: <NotificationIcon />,
              view: "notifications",
            },
          ].map((item) => (
            <ListItem
              key={item.view}
              button
              selected={selectedView === item.view}
              onClick={() => setSelectedView(item.view)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "rgba(0, 123, 255, 0.1)",
                  borderRight: "4px solid #007bff",
                },
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: selectedView === item.view ? "#007bff" : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  color: selectedView === item.view ? "#007bff" : "inherit",
                  fontWeight: selectedView === item.view ? "bold" : "normal",
                }}
              />
            </ListItem>
          ))}

          <ListItem
            button
            sx={{
              mt: 2,
              "&:hover": {
                backgroundColor: "rgba(244, 67, 54, 0.04)",
              },
            }}
            onClick={() => alert("Logout functionality to be implemented")}
          >
            <ListItemIcon sx={{ color: "error.main" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ color: "error.main" }}
            />
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
        <Paper
          elevation={1}
          sx={{
            p: 3,
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              mb: 2,
            }}
          >
            {selectedView === "dashboard" && "Dashboard"}
            {selectedView === "students" && "Student Management"}
            {selectedView === "notifications" && "Send Notifications"}
          </Typography>
        </Paper>

        {selectedView === "dashboard" && renderDashboard()}
        {selectedView === "students" && renderStudents()}
        {selectedView === "notifications" && renderNotificationSection()}
      </Container>
    </Box>
  );
};

export default AdminDashboard;
