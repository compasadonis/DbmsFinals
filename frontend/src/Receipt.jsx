import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";

const ReceiptPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, totalAmount, paymentMethod, cartItems } = location.state || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 4,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 800, borderRadius: 3, boxShadow: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
            Order Receipt
          </Typography>

          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            Thank you for shopping with us!
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1"><strong>Order ID:</strong> {orderId}</Typography>
            <Typography variant="subtitle1"><strong>Payment Method:</strong> {paymentMethod}</Typography>
            <Typography variant="subtitle1"><strong>Status:</strong> {paymentMethod === "Cash" ? "Pending" : "Paid"}</Typography>
            <Typography variant="subtitle1"><strong>Order Date:</strong> {new Date().toLocaleString()}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>Order Summary</Typography>

          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                  <TableCell><strong>Product</strong></TableCell>
                  <TableCell align="center"><strong>Price</strong></TableCell>
                  <TableCell align="center"><strong>Qty</strong></TableCell>
                  <TableCell align="center"><strong>Total</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems?.map((item) => (
                  <TableRow key={item.cart_id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="center">₱{parseFloat(item.price).toFixed(2)}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="center">₱{(item.price * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Typography variant="h6">
              <strong>Grand Total: ₱{parseFloat(totalAmount).toFixed(2)}</strong>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/homepage")}
              sx={{ borderRadius: 2 }}
            >
              Back to Homepage
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePrint}
              startIcon={<PrintIcon />}
              sx={{ borderRadius: 2 }}
            >
              Print Receipt
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReceiptPage;
