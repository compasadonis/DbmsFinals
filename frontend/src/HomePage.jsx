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
  Badge,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box
      sx={{
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <AppBar position="sticky" sx={{ backgroundColor: "#003580" }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>
            My Business
          </Typography>
          <Box>
            <IconButton sx={{ color: "#fff" }}>
              <Badge badgeContent={2} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <IconButton
              sx={{ color: "#fff" }}
              onClick={() => navigate("/customerinfo")}
            >
              <PersonIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Search & Filter */}
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          py: 4,
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ backgroundColor: "#fff", borderRadius: 1 }}
        />
        <TextField
          select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{ backgroundColor: "#fff", borderRadius: 1 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.category_id} value={cat.category_id}>
              {cat.type_of_category}
            </MenuItem>
          ))}
        </TextField>
      </Container>

      {/* Product Grid */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {filteredProducts.length > 0 ? (
          <Grid container spacing={4}>
            {filteredProducts.map((product) => (
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
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#333" }}
                    >
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.description}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ mt: 1, fontWeight: "bold", color: "#1a73e8" }}
                    >
                      ₱{parseFloat(product.price).toFixed(2)}
                    </Typography>
                  </Box>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: "#1a73e8",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#165bbf" },
                      }}
                      startIcon={<AddShoppingCartIcon />}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="h6" color="text.secondary" align="center">
            No products found.
          </Typography>
        )}
      </Container>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: "#003580",
          color: "#fff",
          textAlign: "center",
          py: 2,
        }}
      >
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} My Business. All rights reserved.
        </Typography>
        <Button
          variant="contained"
          onClick={handleLogout}
          sx={{
            backgroundColor: "#757575",
            color: "#fff",
            "&:hover": { backgroundColor: "#616161" },
            mt: 2,
          }}
        >
          Logout
        </Button>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HomePage;
