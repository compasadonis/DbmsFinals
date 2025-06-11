import { useState } from "react";
import axios from "axios";
import { TextField, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password || !role) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/register",
        { username, password, role },
        { headers: { "Content-Type": "application/json" } }
      );
      alert(response.data.message);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
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
        Admin Register
      </Typography>

      <TextField
        label="Username"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        InputLabelProps={{ style: { color: "#d32f2f" } }}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        InputLabelProps={{ style: { color: "#d32f2f" } }}
      />

      <TextField
        label="Role"
        fullWidth
        margin="normal"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        InputLabelProps={{ style: { color: "#d32f2f" } }}
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

      <Button
        variant="outlined"
        fullWidth
        onClick={() => navigate("/customerregister")}
        sx={{
          borderColor: "#d32f2f",
          color: "#d32f2f",
          marginTop: "10px",
          "&:hover": {
            backgroundColor: "#fbe9e7",
            borderColor: "#b71c1c",
          },
        }}
      >
        Register a Customer
      </Button>

      <Typography
        align="center"
        sx={{
          marginTop: "20px",
          color: "#d32f2f",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        Already have an account? Log in
      </Typography>
    </Container>
  );
};

export default Register;
