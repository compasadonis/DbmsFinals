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

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const { username, password, full_name, email, phone, address } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,12}$/;

    if (!username || !password || !full_name || !email || !phone || !address) {
      return "All fields are required.";
    }
    if (!emailRegex.test(email)) {
      return "Invalid email format.";
    }
    if (!phoneRegex.test(phone)) {
      return "Invalid phone number. Must be 10-12 digits.";
    }
    return null;
  };

  const handleRegister = async () => {
    const error = validateForm();
    if (error) {
      setSnackbar({ open: true, message: error, severity: "warning" });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/register-customers",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      setSnackbar({
        open: true,
        message: response.data.message || "Customer registered successfully!",
        severity: "success",
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "An error occurred during registration.",
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
            My Business Registration
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Registration Form */}
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
            Create an Account
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ color: "#555", marginBottom: 4 }}
          >
            Fill in the details below to register.
          </Typography>

          <Box component="form" noValidate>
            {["username", "password", "full_name", "email", "phone", "address"].map((field, index) => (
              <TextField
                key={index}
                name={field}
                label={field.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
                type={field === "password" ? "password" : "text"}
                fullWidth
                margin="normal"
                value={formData[field]}
                onChange={handleChange}
                multiline={field === "address"}
                rows={field === "address" ? 3 : 1}
              />
            ))}
            <Button
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: "#003580",
                color: "#fff",
                marginTop: 2,
                "&:hover": { backgroundColor: "#00224e" },
              }}
              onClick={handleRegister}
            >
              Register
            </Button>
            <Button
              fullWidth
              variant="text"
              sx={{
                marginTop: 2,
                color: "#003580",
                textDecoration: "underline",
              }}
              onClick={() => navigate("/")}
            >
              Back to Login
            </Button>
            <Button
              fullWidth
              variant="text"
              sx={{
                marginTop: 2,
                color: "#003580",
                textDecoration: "underline",
              }}
              onClick={() => navigate("/register")}
            >
              Register as Admin?
            </Button>
          </Box>
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

export default CustomerRegister;
