import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerInfo = () => {
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/customer");
        setCustomer(res.data);
      } catch (err) {
        console.error("Error fetching customer info:", err);
        setError("Failed to load customer information.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      setLoading(true);
      await axios.put("http://localhost:5000/api/customer", customer);
      setSuccess("Customer information updated successfully.");
    } catch (err) {
      console.error("Error updating customer info:", err);
      setError("Failed to update customer information.");
    } finally {
      setLoading(false);
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
        Customer Info
      </Typography>

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}
      {success && (
        <Typography variant="body2" sx={{ color: "green", mb: 1 }}>
          {success}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          fullWidth
          margin="normal"
          value={customer.name}
          onChange={handleChange}
          required
          InputLabelProps={{ style: { color: "#d32f2f" } }}
        />

        <TextField
          label="Email"
          name="email"
          fullWidth
          margin="normal"
          value={customer.email}
          onChange={handleChange}
          required
          InputLabelProps={{ style: { color: "#d32f2f" } }}
        />

        <TextField
          label="Phone"
          name="phone"
          fullWidth
          margin="normal"
          value={customer.phone}
          onChange={handleChange}
          required
          InputLabelProps={{ style: { color: "#d32f2f" } }}
        />

        <TextField
          label="Address"
          name="address"
          fullWidth
          margin="normal"
          value={customer.address}
          onChange={handleChange}
          required
          multiline
          rows={3}
          InputLabelProps={{ style: { color: "#d32f2f" } }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: "#d32f2f",
            color: "#ffffff",
            marginTop: "20px",
            "&:hover": { backgroundColor: "#9a0007" },
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
        </Button>
      </form>

      <Typography
        align="center"
        sx={{
          marginTop: "20px",
          color: "#d32f2f",
          cursor: "pointer",
        }}
        onClick={() => navigate("/homepage")}
      >
        Go to Home Page
      </Typography>
    </Container>
  );
};

export default CustomerInfo;
