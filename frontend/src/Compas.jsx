import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button } from "@mui/material";

const Compas = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [userRole, setRole] = useState("");

  useEffect(() => {
    // Retrieve the user and role from localStorage
    const storedUser = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");

    console.log("Stored User:", storedUser); // Debugging log
    console.log("Stored Role:", storedRole); // Debugging log

    if (storedUser && storedRole) {
      setUser(storedUser);
      setRole(storedRole);

      // If the user is not a staff member, redirect them
      if (storedRole !== "Student1") {
        console.log("Not Compas, redirecting to login..."); // Debugging log
        navigate("/admin");
      }
    } else {
      console.log("No user or role found, redirecting to login..."); // Debugging log
      navigate("/login");
    }
  }, [navigate]);

  return (
    <Container maxWidth="xs" sx={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: 3 }}>
      <Typography variant="h4" sx={{ color: "#d32f2f", textAlign: "center", marginBottom: "20px" }}>
        Welcome {userRole} {user}
      </Typography>

      <Button
        variant="contained"
        color="error"
        fullWidth
        onClick={() => {
          // Clear localStorage and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("role");
          navigate("/login");
        }}
        sx={{ backgroundColor: "#d32f2f", "&:hover": { backgroundColor: "#9a0007" }, marginTop: "20px" }}
      >
        Logout
      </Button>
    </Container>
  );
};

export default Compas;
