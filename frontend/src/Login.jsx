import { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
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

      // Redirect based on role
      if (response.data.role === "admin") {
        navigate("/admin");
      } else if (response.data.role === "staff") {
        navigate("/staff");
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
        backgroundColor: "#e8eaf6",
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar position="sticky" sx={{ backgroundColor: "#003580" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#fff" }}>
            My Business Login
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 6,
            width: "100%",
            maxWidth: 480,
            borderRadius: 3,
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{ color: "#003580", fontWeight: "bold", marginBottom: 3 }}
          >
            Welcome Back
          </Typography>
          <Typography
            variant="body1"
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
              marginTop: 3,
              paddingY: 1.5,
              fontSize: "1rem",
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
              marginTop: 3,
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => navigate("/customerregister")}
          >
            Don't have an account? Register here.
          </Typography>
        </Paper>
      </Box>

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

      <Box
        component="footer"
        sx={{
          backgroundColor: "#003580",
          color: "#fff",
          textAlign: "center",
          padding: 2,
          fontSize: "0.9rem",
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
