import React, { useState } from "react";
import { Select, DatePicker } from "antd";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import Sidebar from "./Sidebar";
import axios from "axios";
import moment from "moment";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Backdrop from "@mui/material/Backdrop";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Create theme for Material-UI components
const theme = createTheme({
  palette: {
    primary: {
      main: "#2196f3",
    },
    success: {
      main: "#4caf50",
    },
    error: {
      main: "#f44336",
    },
  },
});

const StudentDetailsForm = () => {
  const studentId = localStorage.getItem("userId");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [formData, setFormData] = useState({
    basic_details: {
      full_name: "",
      father_name: "",
      mother_name: "",
      date_of_birth: null,
      branch: "",
    },
    tenth_details: {
      school_location: "",
      percentage: 0,
      board: "",
      marksheet_url: null,
      year_of_passing: new Date().getFullYear(),
    },
    twelfth_details: {
      school_location: "",
      percentage: 0,
      board: "",
      marksheet_url: null,
      year_of_passing: new Date().getFullYear(),
    },
    semester_details: [
      {
        semester: 1,
        cgpa: 0,
        no_backlogs: 0,
        marksheet_url: null,
      },
    ],
  });

  // Add the missing addSemester function
  const addSemester = () => {
    setFormData((prev) => ({
      ...prev,
      semester_details: [
        ...prev.semester_details,
        {
          semester: prev.semester_details.length + 1,
          cgpa: 0,
          no_backlogs: 0,
          marksheet_url: null,
        },
      ],
    }));
  };

  const validatePercentage = (value) => {
    const floatValue = parseFloat(value);
    return !isNaN(floatValue) && floatValue >= 0 && floatValue <= 100;
  };

  const validateCGPA = (value) => {
    const floatValue = parseFloat(value);
    return !isNaN(floatValue) && floatValue >= 0 && floatValue <= 10;
  };

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (!file) return { valid: false, error: "File is required" };
    if (!allowedTypes.includes(file.type))
      return {
        valid: false,
        error: "Invalid file type. Only PDF, JPG, and PNG are allowed",
      };
    if (file.size > maxSize)
      return { valid: false, error: "File size must be less than 5MB" };

    return { valid: true, error: null };
  };

  const handleBasicDetailsChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      basic_details: {
        ...prev.basic_details,
        [field]: value,
      },
    }));
  };

  const handleTenthDetailsChange = (field, value) => {
    if (field === "percentage" && !validatePercentage(value)) {
      setError("Percentage must be between 0 and 100");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      tenth_details: {
        ...prev.tenth_details,
        [field]: value,
      },
    }));
  };

  const handleTwelfthDetailsChange = (field, value) => {
    if (field === "percentage" && !validatePercentage(value)) {
      setError("Percentage must be between 0 and 100");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      twelfth_details: {
        ...prev.twelfth_details,
        [field]: value,
      },
    }));
  };

  const handleSemesterChange = (index, field, value) => {
    if (field === "cgpa" && !validateCGPA(value)) {
      setError("CGPA must be between 0 and 10");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      semester_details: prev.semester_details.map((sem, i) =>
        i === index ? { ...sem, [field]: value } : sem
      ),
    }));
  };

  // Updated handleFileChange to handle semester files correctly
  const handleFileChange = (section, field, file, semesterIndex = null) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    if (section === "semester_details") {
      setFormData((prev) => ({
        ...prev,
        semester_details: prev.semester_details.map((sem, index) =>
          index === semesterIndex ? { ...sem, marksheet_url: file } : sem
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: file,
        },
      }));
    }
  };
  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!studentId) {
      setAlertMessage("No student ID found. Please login again.");
      setAlertSeverity("error");
      setAlertOpen(true);
      setLoading(false);
      return;
    }

    try {
      // 1. First submit the basic student details
      const submissionData = {
        basic_details: {
          ...formData.basic_details,
          date_of_birth: formData.basic_details.date_of_birth
            ? moment(formData.basic_details.date_of_birth).format("YYYY-MM-DD")
            : null,
        },
        tenth_details: {
          ...formData.tenth_details,
          marksheet_url: "", // Will be updated after file upload
        },
        twelfth_details: {
          ...formData.twelfth_details,
          marksheet_url: "", // Will be updated after file upload
        },
        semester_details: formData.semester_details.map((sem) => ({
          ...sem,
          marksheet_url: "", // Will be updated after file upload
        })),
      };

      // Submit initial student details
      const detailsResponse = await axios.post(
        `http://localhost:8000/student-detail?student_id=${studentId}`,
        submissionData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (detailsResponse.status !== 200) {
        throw new Error("Failed to save student details");
      }

      // 2. Validate required files
      if (!formData.tenth_details.marksheet_url) {
        throw new Error("10th marksheet is required");
      }
      if (!formData.twelfth_details.marksheet_url) {
        throw new Error("12th marksheet is required");
      }
      formData.semester_details.forEach((sem) => {
        if (!sem.marksheet_url) {
          throw new Error(`Semester ${sem.semester} marksheet is required`);
        }
      });

      // 3. Upload marksheets
      const fileFormData = new FormData();
      fileFormData.append(
        "tenth_marksheet",
        formData.tenth_details.marksheet_url
      );
      fileFormData.append(
        "twelfth_marksheet",
        formData.twelfth_details.marksheet_url
      );
      formData.semester_details.forEach((sem) => {
        fileFormData.append("semester_marksheets", sem.marksheet_url);
      });

      // Upload marksheets
      const fileResponse = await axios.put(
        `http://localhost:8000/upload-marksheets?student_id=${studentId}`,
        fileFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (fileResponse.status === 200) {
        setAlertMessage("Form submitted and files uploaded successfully!");
        setAlertSeverity("success");
        setAlertOpen(true);

        // Optional: You can update your local state with the new URLs if needed
        const uploadedUrls = fileResponse.data.marksheet_urls;
        setFormData((prev) => ({
          ...prev,
          tenth_details: {
            ...prev.tenth_details,
            marksheet_url: uploadedUrls.tenth_marksheet_url,
          },
          twelfth_details: {
            ...prev.twelfth_details,
            marksheet_url: uploadedUrls.twelfth_marksheet_url,
          },
          semester_details: prev.semester_details.map((sem, index) => ({
            ...sem,
            marksheet_url: uploadedUrls.semester_marksheets_urls[index],
          })),
        }));
      }
    } catch (error) {
      console.error("Error details:", error);
      setAlertMessage(
        error.response?.data?.detail ||
          error.message ||
          "Error submitting form. Please try again."
      );
      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };
  const branchOptions = [
    {
      value: "Computer Science Engineering",
      label: "Computer Science Engineering",
    },
    { value: "Information Technology", label: "Information Technology" },
    {
      value: "Electronics & Communication Engineering",
      label: "Electronics & Communication Engineering",
    },
    { value: "Electrical Engineering", label: "Electrical Engineering" },
    {
      value: "Electrical and Electronics Engineering",
      label: "Electrical and Electronics Engineering",
    },
    { value: "Mechanical Engineering", label: "Mechanical Engineering" },
    { value: "Civil Engineering", label: "Civil Engineering" },
    {
      value: "Computer Science Engineering(AI & ML)",
      label: "Computer Science Engineering(AI & ML)",
    },
    {
      value: "Computer Science Engineering(AI)",
      label: "Computer Science Engineering(AI)",
    },
    {
      value: "Computer Science Engineering(Data Science)",
      label: "Computer Science Engineering(Data Science)",
    },
    {
      value: "Computer Science Engineering(IoT)",
      label: "Computer Science Engineering(IoT)",
    },
    {
      value: "Computer Science Engineering(IoT & Cyber Security)",
      label: "Computer Science Engineering(IoT & Cyber Security)",
    },
    {
      value: "Computer Science Engineering(Big Data Analytics)",
      label: "Computer Science Engineering(Big Data Analytics)",
    },
  ];

  const boardOptions = [
    { value: "CBSE", label: "CBSE" },
    { value: "ICSE", label: "ICSE" },
    { value: "State Board", label: "State Board" },
  ];

  return (
    <ThemeProvider theme={theme}>
      <div
        className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="flex">
          <div className="w-1/4 h-screen fixed">
            <Sidebar isDarkMode={isDarkMode} />
          </div>

          <div className="flex-1 pl-[25%]">
            <div className="container mx-auto px-4 py-8">
              <Card className="max-w-4xl mx-auto shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">
                    Student Details Form
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Details Section */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input
                            value={formData.basic_details.full_name}
                            onChange={(e) =>
                              handleBasicDetailsChange(
                                "full_name",
                                e.target.value
                              )
                            }
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Father's Name</Label>
                          <Input
                            value={formData.basic_details.father_name}
                            onChange={(e) =>
                              handleBasicDetailsChange(
                                "father_name",
                                e.target.value
                              )
                            }
                            placeholder="Enter father's name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Mother's Name</Label>
                          <Input
                            value={formData.basic_details.mother_name}
                            onChange={(e) =>
                              handleBasicDetailsChange(
                                "mother_name",
                                e.target.value
                              )
                            }
                            placeholder="Enter mother's name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Date of Birth</Label>
                          <DatePicker
                            className="w-full"
                            value={formData.basic_details.date_of_birth}
                            onChange={(date) =>
                              handleBasicDetailsChange("date_of_birth", date)
                            }
                            format="YYYY-MM-DD"
                            placeholder="Select date of birth"
                            disabledDate={(current) =>
                              current && current > moment().endOf("day")
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Branch</Label>
                          <Select
                            className="w-full"
                            value={formData.basic_details.branch}
                            onChange={(value) =>
                              handleBasicDetailsChange("branch", value)
                            }
                            options={branchOptions}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* 10th Details Section */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold">
                        10th Class Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>School Location</Label>
                          <Input
                            value={formData.tenth_details.school_location}
                            onChange={(e) =>
                              handleTenthDetailsChange(
                                "school_location",
                                e.target.value
                              )
                            }
                            placeholder="Enter school location"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Percentage</Label>
                          <Input
                            type="number"
                            value={formData.tenth_details.percentage}
                            onChange={(e) =>
                              handleTenthDetailsChange(
                                "percentage",
                                e.target.value
                              )
                            }
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="Enter percentage"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Board</Label>
                          <Select
                            className="w-full"
                            value={formData.tenth_details.board}
                            onChange={(value) =>
                              handleTenthDetailsChange("board", value)
                            }
                            options={boardOptions}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Marksheet (10th)</Label>
                          <Input
                            type="file"
                            onChange={(e) =>
                              handleFileChange(
                                "tenth_details",
                                "marksheet_url",
                                e.target.files[0]
                              )
                            }
                            accept=".pdf,.jpg,.jpeg,.png"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Year of Passing</Label>
                          <Input
                            type="number"
                            value={formData.tenth_details.year_of_passing}
                            onChange={(e) =>
                              handleTenthDetailsChange(
                                "year_of_passing",
                                e.target.value
                              )
                            }
                            min="1900"
                            max={new Date().getFullYear()}
                            placeholder="Enter year of passing"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold">
                        12th Class Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>School Location</Label>
                          <Input
                            value={formData.twelfth_details.school_location}
                            onChange={(e) =>
                              handleTwelfthDetailsChange(
                                "school_location",
                                e.target.value
                              )
                            }
                            placeholder="Enter school location"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Percentage</Label>
                          <Input
                            type="number"
                            value={formData.twelfth_details.percentage}
                            onChange={(e) =>
                              handleTwelfthDetailsChange(
                                "percentage",
                                e.target.value
                              )
                            }
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="Enter percentage"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Board</Label>
                          <Select
                            className="w-full"
                            value={formData.twelfth_details.board}
                            onChange={(value) =>
                              handleTwelfthDetailsChange("board", value)
                            }
                            options={boardOptions}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Marksheet (12th)</Label>
                          <Input
                            type="file"
                            onChange={(e) =>
                              handleFileChange(
                                "twelfth_details",
                                "marksheet_url",
                                e.target.files[0]
                              )
                            }
                            accept=".pdf,.jpg,.jpeg,.png"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Year of Passing</Label>
                          <Input
                            type="number"
                            value={formData.twelfth_details.year_of_passing}
                            onChange={(e) =>
                              handleTwelfthDetailsChange(
                                "year_of_passing",
                                e.target.value
                              )
                            }
                            min="1900"
                            max={new Date().getFullYear()}
                            placeholder="Enter year of passing"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Semester Details Section */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold">
                        Semester Details
                      </h3>
                      {formData.semester_details.map((sem, index) => (
                        <div key={index} className="space-y-4">
                          <h4 className="text-lg font-medium">
                            Semester {sem.semester}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label>CGPA</Label>
                              <Input
                                type="number"
                                value={sem.cgpa}
                                onChange={(e) =>
                                  handleSemesterChange(
                                    index,
                                    "cgpa",
                                    e.target.value
                                  )
                                }
                                min="0"
                                max="10"
                                step="0.1"
                                placeholder="Enter CGPA"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Number of Backlogs</Label>
                              <Input
                                type="number"
                                value={sem.no_backlogs}
                                onChange={(e) =>
                                  handleSemesterChange(
                                    index,
                                    "no_backlogs",
                                    e.target.value
                                  )
                                }
                                min="0"
                                placeholder="Enter number of backlogs"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Marksheet (Semester {sem.semester})</Label>
                              <Input
                                type="file"
                                onChange={(e) =>
                                  handleFileChange(
                                    "semester_details",
                                    "marksheet_url",
                                    e.target.files[0],
                                    index
                                  )
                                }
                                accept=".pdf,.jpg,.jpeg,.png"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={addSemester}
                        className="mt-4"
                      >
                        Add Another Semester
                      </Button>
                    </div>

                    <Separator />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full mt-6 relative"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          Submitting
                          <CircularProgress
                            size={20}
                            className="ml-2"
                            style={{ color: "white" }}
                          />
                        </span>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Snackbar
          open={alertOpen}
          autoHideDuration={6000}
          onClose={handleAlertClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleAlertClose}
            severity={alertSeverity}
            sx={{ width: "100%" }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
};

export default StudentDetailsForm;
