  import { useState } from "react";
  import axios from "axios";
  import {
    TextField,
    Button,
    Box,
    Typography,
    Paper,
    Alert,
  } from "@mui/material";
  import { useNavigate } from "react-router-dom";

  const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
      setErrorMessage("");
      setSuccessMessage("");

      if (!username || !password || !role) {
        setErrorMessage("All fields are required.");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:5000/register",
          { username, password, role },
          { headers: { "Content-Type": "application/json" } }
        );
        setSuccessMessage(response.data.message || "Registration successful!");
        setTimeout(() => navigate("/"), 2000);
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message || "Registration failed. Please try again."
        );
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
        <Box
          sx={{
            backgroundColor: "#003580",
            color: "#fff",
            padding: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h6">Admin Register</Typography>
        </Box>

        {/* Registration Form */}
        <Box
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
              Please fill out the form below to register.
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ marginBottom: 2 }}>
                {errorMessage}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" sx={{ marginBottom: 2 }}>
                {successMessage}
              </Alert>
            )}

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
            <TextField
              label="Role"
              fullWidth
              value={role}
              onChange={(e) => setRole(e.target.value)}
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
              onClick={handleRegister}
            >
              Register
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
              onClick={() => navigate("/")}
            >
              Already have an account? Log in here.
            </Typography>
          </Paper>
        </Box>

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

  export default Register;