import React from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Create a more professional theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Professional blue
    },
    background: {
      default: "#f4f6f9",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
});

const ScorefolioHomePage = () => {
  // Use navigate hook for routing
  const navigate = useNavigate();

  // Handler for student login navigation
  const handleStudentLogin = () => {
    navigate("/student-login");
  };

  // Handler for admin login navigation
  const handleAdminLogin = () => {
    navigate("/admin-login");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            textAlign: "center",
          }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              borderRadius: 3,
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            }}
          >
            {/* Logo placeholder */}
            <Box
              component="img"
              sx={{
                height: 80,
                mb: 3,
                objectFit: "contain",
              }}
              alt="Scorefolio Logo"
              src="https://cdn2.joinsuperset.com/students/static/media/superset-logo.23e4e1907b29549ceb57509d5f118ba1.svg"
            />

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "primary.main",
                mb: 2,
              }}
            >
              Scorefolio
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                mb: 3,
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              Placement Management System
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleStudentLogin}
              >
                Student Login
              </Button>

              <Button
                variant="outlined"
                color="primary"
                size="large"
                fullWidth
                onClick={handleAdminLogin}
              >
                Admin Login
              </Button>
            </Box>
          </Paper>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            © {new Date().getFullYear()} Scorefolio. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default ScorefolioHomePage;
