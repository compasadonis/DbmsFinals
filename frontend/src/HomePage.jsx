import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardActions,
  TextField,
  MenuItem,
  Container,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/category");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const handleAddToCart = async (product) => {
    if (product.quantity <= 0) {
      setSnackbar({
        open: true,
        message: "This product is out of stock.",
        severity: "warning",
      });
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/cart", {
        customer_id: 1,
        product_id: product.product_id,
        quantity: 1,
      });

      setSnackbar({
        open: true,
        message: "Product added to cart!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      setSnackbar({
        open: true,
        message: "Failed to add product to cart",
        severity: "error",
      });
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLogout = () => {
    setSnackbar({ open: true, message: "Logged out (dummy behavior).", severity: "info" });
    navigate("/");
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <AppBar position="sticky" sx={{ backgroundColor: "#003580" }}>
        <Toolbar
          sx={{
            maxWidth: "1400px",
            width: "100%",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>
            DEPARTMENT STORE
          </Typography>
          <Box>
            <IconButton sx={{ color: "#fff" }} onClick={() => navigate("/customercart")}>
              <ShoppingCartIcon />
            </IconButton>
            <IconButton sx={{ color: "#fff" }} onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ maxWidth: "1400px", width: "100%", flexGrow: 1, paddingY: 6 }}>
        {/* Search & Filter */}
        <Box sx={{ display: "flex", gap: 3, marginBottom: 4, justifyContent: "center" }}>
          <TextField
            variant="outlined"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ backgroundColor: "#fff", borderRadius: 1, width: "40%", maxWidth: "500px" }}
          />
          <TextField
            select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            variant="outlined"
            sx={{ backgroundColor: "#fff", borderRadius: 1, width: "20%", maxWidth: "250px" }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.category_id} value={cat.category_id}>
                {cat.type_of_category}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Product Grid */}
        <Grid container spacing={4}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.product_id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      product.product_image
                        ? `data:image/jpeg;base64,${product.product_image}`
                        : "https://via.placeholder.com/150"
                    }
                    alt={product.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.description}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1, fontWeight: "bold", color: "#1a73e8" }}>
                      ₱{parseFloat(product.price).toFixed(2)}
                    </Typography>
                  </Box>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: "#003580",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#00224e" },
                      }}
                      startIcon={<AddShoppingCartIcon />}
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="h6" color="text.secondary" sx={{ textAlign: "center", width: "100%" }}>
              No products found.
            </Typography>
          )}
        </Grid>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ backgroundColor: "#003580", color: "#fff", textAlign: "center", py: 3, mt: 6 }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} My Business. All rights reserved.
        </Typography>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HomePage;
