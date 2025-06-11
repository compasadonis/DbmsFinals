import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerInfo = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/customer");
        setCustomer(res.data);
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to load customer information.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const validateInputs = () => {
    if (!customer.name || !customer.email || !customer.phone || !customer.address) {
      setSnackbar({ open: true, message: "All fields are required.", severity: "warning" });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      setSnackbar({ open: true, message: "Invalid email address.", severity: "warning" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await axios.put("http://localhost:5000/api/customer", customer);
      setSnackbar({ open: true, message: "Information updated successfully.", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Update failed. Please try again.", severity: "error" });
    } finally {
      setLoading(false);
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
            Manage Customer Info
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Customer Info Form */}
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
            Update Info
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ color: "#555", marginBottom: 4 }}
          >
            Please update your customer information below.
          </Typography>
          <TextField
            label="Name"
            name="name"
            fullWidth
            value={customer.name}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Email"
            name="email"
            fullWidth
            value={customer.email}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Phone"
            name="phone"
            fullWidth
            value={customer.phone}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Address"
            name="address"
            fullWidth
            value={customer.address}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            multiline
            rows={3}
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
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              color: "#003580",
              borderColor: "#003580",
              marginTop: 2,
              "&:hover": { backgroundColor: "#f0f4ff" },
            }}
            onClick={() => navigate("/homepage")}
          >
            Back to Homepage
          </Button>
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
          &copy; {new Date().getFullYear()} Customer Portal. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default CustomerInfo;
