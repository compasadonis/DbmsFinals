import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  Paper,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", px: 6, py: 4 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", color: "black" }}
      >
        Customer Information
      </Typography>

      <Box display="flex" justifyContent="center" mb={4}>
        <Button variant="contained" color="primary" onClick={() => navigate("/")}>
          Go to Homepage
        </Button>
      </Box>

      <Card sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
        {error && (
          <Typography variant="body2" color="error" gutterBottom>
            {error}
          </Typography>
        )}
        {success && (
          <Typography variant="body2" sx={{ color: "success.main" }} gutterBottom>
            {success}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={customer.name}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={customer.email}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={customer.phone}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={customer.address}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={3}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
};

export default CustomerInfo;
