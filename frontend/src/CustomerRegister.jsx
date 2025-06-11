import { useState } from "react";
import axios from "axios";
import { TextField, Button, Container, Typography, Alert } from "@mui/material";
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
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
    setErrorMessage("");
    setSuccessMessage("");

    const error = validateForm();
    if (error) {
      setErrorMessage(error);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/register-customers",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      setSuccessMessage(response.data.message || "Customer registered successfully!");
      setTimeout(() => navigate("/HomePage"), 2000); // Redirect to login
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "An error occurred during registration."
      );
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        backgroundColor: "#fff",
        border: "1px solid #d32f2f",
        borderRadius: "8px",
        padding: "20px",
        marginTop: "50px",
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{ marginBottom: "20px", color: "#d32f2f" }}
      >
        Customer Register
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ marginBottom: "20px" }}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ marginBottom: "20px" }}>
          {successMessage}
        </Alert>
      )}

      <TextField
        name="username"
        label="Username"
        fullWidth
        margin="normal"
        value={formData.username}
        onChange={handleChange}
      />
      <TextField
        name="password"
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={formData.password}
        onChange={handleChange}
      />
      <TextField
        name="full_name"
        label="Full Name"
        fullWidth
        margin="normal"
        value={formData.full_name}
        onChange={handleChange}
      />
      <TextField
        name="email"
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        value={formData.email}
        onChange={handleChange}
      />
      <TextField
        name="phone"
        label="Phone"
        fullWidth
        margin="normal"
        value={formData.phone}
        onChange={handleChange}
      />
      <TextField
        name="address"
        label="Address"
        fullWidth
        margin="normal"
        multiline
        rows={3}
        value={formData.address}
        onChange={handleChange}
      />

      <Button
        variant="contained"
        fullWidth
        onClick={handleRegister}
        sx={{
          backgroundColor: "#d32f2f",
          color: "#ffffff",
          marginTop: "20px",
          "&:hover": { backgroundColor: "#9a0007" },
        }}
      >
        Register
      </Button>

      <Typography
        align="center"
        sx={{ marginTop: "20px", color: "#d32f2f", cursor: "pointer" }}
        onClick={() => navigate("/register")}
      >
        Register as Admin?
      </Typography>

      <Button
        variant="text"
        fullWidth
        onClick={() => navigate("/")}
        sx={{ color: "#d32f2f", marginTop: "10px" }}
      >
        Back to Login
      </Button>
    </Container>
  );
};

export default CustomerRegister;
