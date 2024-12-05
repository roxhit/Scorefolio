import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Container,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const AdminLogin = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic client-side validation
    if (!adminId || !password) {
      setError("Please enter both Admin ID and Password");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/admin-login",
        {
          admin_id: adminId,
          admin_password: password,
        },
        {
          // Add timeout and error handling
          timeout: 5000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // More secure way of handling tokens
      localStorage.setItem("adminToken", response.data.access_token);
      navigate("/admin-dashboard");
      // Redirect or navigate to admin dashboard
      // For React Router: history.push('/dashboard')
      alert("Login Successful!");
    } catch (err) {
      if (err.response) {
        // The request was made and the server responded with a status code
        setError(err.response.data.detail || "Login failed. Please try again.");
      } else if (err.request) {
        // The request was made but no response was received
        setError("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };

  return (
    <Container maxWidth="xs">
      <Paper
        elevation={6}
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          sx={{ mb: 3, fontWeight: "bold" }}
        >
          Admin Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          {error && (
            <Typography
              variant="body2"
              color="error"
              sx={{
                mb: 2,
                textAlign: "center",
                backgroundColor: "#ffebee",
                padding: 1,
                borderRadius: 1,
              }}
            >
              {error}
            </Typography>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            label="Admin ID"
            autoComplete="username"
            autoFocus
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            error={!!error}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              height: 50,
              position: "relative",
            }}
          >
            {loading ? (
              <CircularProgress
                size={24}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-12px",
                  marginLeft: "-12px",
                }}
              />
            ) : (
              "Sign In"
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminLogin;
