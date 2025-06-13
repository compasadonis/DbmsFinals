import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardActions,
  Container,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CustomerCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !username) {
      setSnackbar({ open: true, message: "Please log in to access the cart.", severity: "warning" });
      navigate("/");
    } else {
      fetchCartItems();
    }
  }, [navigate, username]);

  const fetchCartItems = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${username}`);
      setCartItems(res.data);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setSnackbar({ open: true, message: "Failed to fetch cart items.", severity: "error" });
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${username}/${itemId}`);
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      setSnackbar({ open: true, message: "Item removed from cart.", severity: "success" });
    } catch (err) {
      console.error("Error removing item:", err);
      setSnackbar({ open: true, message: "Failed to remove item.", severity: "error" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setSnackbar({ open: true, message: "You have been logged out.", severity: "success" });
    navigate("/");
  };

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <AppBar position="sticky" sx={{ backgroundColor: "#003580" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>
            {username}'s Cart
          </Typography>
          <Box>
            <IconButton sx={{ color: "#fff" }} onClick={() => navigate("/homepage")}>
              <HomeIcon />
            </IconButton>
            <IconButton sx={{ color: "#fff" }} onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ flexGrow: 1, py: 6 }}>
        <Grid container spacing={4}>
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card sx={{ borderRadius: 4, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      item.product_image
                        ? `data:image/jpeg;base64,${item.product_image}`
                        : "https://via.placeholder.com/150"
                    }
                    alt={item.name}
                  />
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                    <Typography sx={{ mt: 1, fontWeight: "bold" }}>
                      ₱{parseFloat(item.price).toFixed(2)} × {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: ₱{(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                  <CardActions>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remove
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="h6" color="text.secondary" sx={{ textAlign: "center", width: "100%" }}>
              Your cart is empty.
            </Typography>
          )}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ backgroundColor: "#003580", color: "#fff", textAlign: "center", py: 3 }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} My Business. All rights reserved.
        </Typography>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerCart;
