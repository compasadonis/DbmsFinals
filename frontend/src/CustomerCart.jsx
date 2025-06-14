import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
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
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CustomerCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [updatingItem, setUpdatingItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/cart/1`);
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

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const handleQuantityChange = async (cartId, newQuantity) => {
    const quantity = parseInt(newQuantity);
    
    if (isNaN(quantity) || quantity < 1 || updatingItem === cartId) return;

    setUpdatingItem(cartId);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/cart/update-quantity/${cartId}`,
        { quantity },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.cart_id === cartId ? { ...item, quantity } : item
          )
        );
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update quantity",
        severity: "error",
      });
    } finally {
      setUpdatingItem(null);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const orderRes = await axios.post("http://localhost:5000/api/orders", {
        customer_id: 1,
        total_amount: calculateTotal(),
      });

      const order_id = orderRes.data.order_id;

      await Promise.all(
        cartItems.map(item =>
          axios.post("http://localhost:5000/api/order-items", {
            order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          })
        )
      );

      await Promise.all(
        cartItems.map(item =>
          axios.put(`http://localhost:5000/api/products/reduce/${item.product_id}`, {
            quantity: item.quantity,
          })
        )
      );

      const paymentStatus = paymentMethod === "Cash" ? "Pending" : "Completed";

      await axios.post("http://localhost:5000/api/payments", {
        order_id,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
      });

      await axios.delete(`http://localhost:5000/api/cart/clear/1`);

      navigate("/receipt", {
        state: {
          orderId: order_id,
          totalAmount: calculateTotal(),
          paymentMethod,
          cartItems,
        },
      });
    } catch (err) {
      console.error("Error during checkout:", err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || "Checkout failed", 
        severity: "error" 
      });
    }
  };

  const handleRemoveItem = async (cartId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${cartId}`);
      setCartItems(cartItems.filter(item => item.cart_id !== cartId));
      setSnackbar({ 
        open: true, 
        message: "Item removed from cart", 
        severity: "success" 
      });
    } catch (err) {
      console.error("Error removing item:", err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || "Failed to remove item", 
        severity: "error" 
      });
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky" sx={{ backgroundColor: "#003580" }}>
        <Toolbar>
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
                              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>{item.name}</Typography>
                              <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">₱{parseFloat(item.price).toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || parseInt(value) > 0) {
                                handleQuantityChange(item.cart_id, value);
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value === "") {
                                handleQuantityChange(item.cart_id, 1);
                              }
                            }}
                            inputProps={{ 
                              min: 1,
                              step: 1
                            }}
                            sx={{ width: 70 }}
                            disabled={updatingItem === item.cart_id}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold" }}>
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            color="error" 
                            onClick={() => handleRemoveItem(item.cart_id)}
                            disabled={updatingItem === item.cart_id}
                          >
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
                  <TextField
                    select
                    label="Payment Method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {["Cash", "Credit Card", "Debit Card", "GCash", "PayMaya", "Bank Transfer", "PayPal", "Other"].map((method) => (
                      <MenuItem key={method} value={method}>{method}</MenuItem>
                    ))}
                  </TextField>
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
                      "&:disabled": { backgroundColor: "#cccccc" }
                    }}
                    onClick={handlePlaceOrder}
                    disabled={cartItems.length === 0 || updatingItem !== null}
                  >
                    {updatingItem ? "PROCESSING..." : "PLACE ORDER"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center" }}>
            <ShoppingCartCheckoutIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "text.secondary", mb: 1 }}>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Looks like you haven't added any items to your cart yet
            </Typography>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#003580", color: "#fff", "&:hover": { backgroundColor: "#00224e" } }}
              onClick={() => navigate("/homepage")}
            >
              CONTINUE SHOPPING
            </Button>
          </Box>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerCart;