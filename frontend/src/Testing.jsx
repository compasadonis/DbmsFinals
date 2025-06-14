import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";

const Testing = () => {
  const [products, setProducts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Fetch error", error);
    }
  };

  const reduceQuantity = async (product_id) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/products/reduce/${product_id}`);
      setSnackbar({ open: true, message: response.data.message, severity: "success" });
      fetchProducts(); // Refresh after update
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error reducing quantity.",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Product Inventory</Typography>
      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.product_id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography>Quantity: {product.quantity}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => reduceQuantity(product.product_id)}
                  disabled={product.quantity <= 0}
                  style={{ marginTop: 10 }}
                >
                  Reduce Quantity
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Testing;
