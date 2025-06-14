import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Container,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Snackbar,
  Alert,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CustomerCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  const navigate = useNavigate();

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/cart/1`); // Default customer ID
        setCartItems(res.data);
      } catch (err) {
        console.error("Error fetching cart items:", err);
        setSnackbar({
          open: true,
          message: "Failed to load cart items",
          severity: "error",
        });
      }
    };

    fetchCartItems();
  }, []);

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    ).toFixed(2);
  };

  // Update quantity
  const handleQuantityChange = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axios.put(`http://localhost:5000/api/cart/${cartId}`, { quantity: newQuantity });

      // Log the transaction
      await axios.post("http://localhost:5000/api/transactions", {
        product_id: cartItems.find(item => item.cart_id === cartId).product_id,
        action_type: "Pending",
        quantity: newQuantity,
      });

      setCartItems(cartItems.map(item =>
        item.cart_id === cartId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (err) {
      console.error("Error updating quantity:", err);
      setSnackbar({
        open: true,
        message: "Failed to update quantity",
        severity: "error",
      });
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (cartId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${cartId}`);
      setCartItems(cartItems.filter(item => item.cart_id !== cartId));
      setSnackbar({
        open: true,
        message: "Item removed from cart",
        severity: "success",
      });
    } catch (err) {
      console.error("Error removing item:", err);
      setSnackbar({
        open: true,
        message: "Failed to remove item",
        severity: "error",
      });
    }
  };

  // Checkout
  const handlePlaceOrder = async () => {
    try {
      const orderRes = await axios.post("http://localhost:5000/api/orders", {
        customer_id: 1, // Default customer ID
        total_amount: calculateTotal(),
      });

      // Add order items
      await Promise.all(
        cartItems.map(item =>
          axios.post("http://localhost:5000/api/order-items", {
            order_id: orderRes.data.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          })
        )
      );

      // Log the transaction
      await axios.post("http://localhost:5000/api/transactions", {
        product_id: null, // Null for bulk order
        action_type: "Completed",
        quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      });

      // Clear the cart
      await axios.delete(`http://localhost:5000/api/cart/clear/1`);
      setSnackbar({
        open: true,
        message: "Order placed successfully!",
        severity: "success",
      });
      setCartItems([]);
    } catch (err) {
      console.error("Error during checkout:", err);
      setSnackbar({
        open: true,
        message: "Checkout failed",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
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
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton sx={{ color: "#fff", mr: 2 }} onClick={() => navigate("/homepage")}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>
              YOUR SHOPPING CART
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>
            {cartItems.length} ITEMS
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ maxWidth: "1400px", width: "100%", flexGrow: 1, paddingY: 4 }}>
        {cartItems.length > 0 ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
                    <TableRow>
                      <TableCell>PRODUCT</TableCell>
                      <TableCell align="center">PRICE</TableCell>
                      <TableCell align="center">QUANTITY</TableCell>
                      <TableCell align="center">TOTAL</TableCell>
                      <TableCell align="center">ACTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.cart_id}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <CardMedia
                              component="img"
                              image={item.product_image ? `data:image/jpeg;base64,${item.product_image}` : "https://via.placeholder.com/150"}
                              alt={item.name}
                              sx={{ width: 80, height: 80, objectFit: "cover", mr: 2 }}
                            />
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                {item.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.description}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">₱{parseFloat(item.price).toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.cart_id, parseInt(e.target.value))}
                            inputProps={{ min: 1 }}
                            sx={{ width: 70 }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold" }}>
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton color="error" onClick={() => handleRemoveItem(item.cart_id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>CHECK OUT</Typography>
                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>₱{calculateTotal()}</Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<ShoppingCartCheckoutIcon />}
                    sx={{
                      backgroundColor: "#003580",
                      color: "#fff",
                      py: 1.5,
                      "&:hover": { backgroundColor: "#00224e" },
                    }}
                    onClick={handlePlaceOrder}
                  >
                    PLACE ORDER
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "60vh",
              textAlign: "center",
            }}
          >
            <ShoppingCartCheckoutIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "text.secondary", mb: 1 }}>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Looks like you haven't added any items to your cart yet
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#003580",
                color: "#fff",
                "&:hover": { backgroundColor: "#00224e" },
              }}
              onClick={() => navigate("/homepage")}
            >
              CONTINUE SHOPPING
            </Button>
          </Box>
        )}
      </Container>

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

export default CustomerCart;
