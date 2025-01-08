import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";

const Login = () => {
  const [student_id, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (!student_id || !password) {
      setError("Please fill in all fields");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/student-login", {
        student_id,
        password,
      });

      if (response.data.token && response.data.student_name) {
        // Store authentication details securely
        localStorage.setItem("usersdatatoken", response.data.token);
        localStorage.setItem("userName", response.data.student_name);
        localStorage.setItem("userId", response.data.student_id);

        // Navigate to dashboard on successful login
        navigate("/dashboard");
      } else {
        setError("Invalid login response. Please try again.");
      }
    } catch (error) {
      // More specific error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        setError(
          error.response.data.message ||
            "Login failed. Please check your credentials."
        );
      } else if (error.request) {
        // The request was made but no response was received
        setError(
          "No response from server. Please check your network connection."
        );
      } else {
        // Something happened in setting up the request
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
        }}
      >
        <img
          src="https://cdn2.joinsuperset.com/students/static/media/superset-logo.23e4e1907b29549ceb57509d5f118ba1.svg"
          alt="Superset Logo"
          style={{
            width: 150,
            marginBottom: 20,
          }}
        />

        <Typography component="h1" variant="h5">
          Student Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: "100%", mt: 1 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            label="Student ID"
            value={student_id}
            onChange={(e) => setStudentId(e.target.value)}
            autoComplete="username"
            autoFocus
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>

          <Typography variant="body2" align="center">
            Don't have an account?{" "}
            <Link to="/student-signup" style={{ textDecoration: "none" }}>
              Sign up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
