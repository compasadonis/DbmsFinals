import { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setSnackbar({
        open: true,
        message: "Please fill in all fields",
        severity: "warning",
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("role", response.data.role);

      setSnackbar({
        open: true,
        message: "Login successful!",
        severity: "success",
      });

      if (response.data.role === "admin") {
        navigate("/admin");
      } else if (response.data.role === "user") {
        navigate("/homepage");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Invalid credentials",
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <AppBar position="sticky" sx={{ backgroundColor: "#003580" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#fff" }}>
            My Business Login
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Login Form */}
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexGrow: 1,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: "100%",
            maxWidth: 400,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              color: "#003580",
              fontWeight: "bold",
              marginBottom: 2,
            }}
          >
            Welcome Back
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ color: "#555", marginBottom: 4 }}
          >
            Please enter your credentials to login.
          </Typography>
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#003580",
              color: "#fff",
              marginTop: 2,
              "&:hover": { backgroundColor: "#00224e" },
            }}
            onClick={handleLogin}
          >
            Login
          </Button>
          <Typography
            variant="body2"
            align="center"
            sx={{
              color: "#777",
              marginTop: 2,
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => navigate("/customerregister")}
          >
            Don't have an account? Register here.
          </Typography>
        </Paper>
      </Container>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: "#003580",
          color: "#fff",
          textAlign: "center",
          padding: 2,
        }}
      >
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} My Business. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
