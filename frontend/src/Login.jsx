import { useState } from "react";
import axios from "axios";
import { TextField, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      // Store token, username, and role in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("role", response.data.role);

      alert("Login successful!");
      navigate("/admin"); // Redirect to dashboard
    } catch (error) {
      alert(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: 3,
        marginTop: "50px",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: "#d32f2f",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Login
      </Typography>
      <TextField
        label="Username"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{
          input: { color: "#d32f2f" },
          label: { color: "#d32f2f" },
          marginBottom: "10px",
        }}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{
          input: { color: "#d32f2f" },
          label: { color: "#d32f2f" },
          marginBottom: "20px",
        }}
      />
      <Button
        variant="contained"
        color="error"
        fullWidth
        onClick={handleLogin}
        sx={{
          backgroundColor: "#d32f2f",
          "&:hover": { backgroundColor: "#9a0007" },
        }}
      >
        Login
      </Button>

      {/* Register as Customer button */}
      <Button
        variant="outlined"
        fullWidth
        sx={{
          borderColor: "#d32f2f",
          color: "#d32f2f",
          marginTop: "15px",
          "&:hover": { backgroundColor: "#ffebee", borderColor: "#9a0007" },
        }}
        onClick={() => navigate("/customerregister")}
      >
        Register as Customer
      </Button>
    </Container>
  );
};

export default Login;
