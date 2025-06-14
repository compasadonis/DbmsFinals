import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  AppBar,
  Toolbar,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  TablePagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Staff = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "info" 
  });

  useEffect(() => {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (!username || role !== "staff") {
      navigate("/");
    } else {
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, productsRes, ordersRes] = await Promise.all([
        axios.get("http://localhost:5000/api/transactions"),
        axios.get("http://localhost:5000/api/products"),
        axios.get("http://localhost:5000/api/orders"),
      ]);

      setTransactions(transactionsRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch data. Please try again later.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId) => {
    if (!productId) return "N/A";
    const product = products.find((p) => p.product_id === productId);
    return product ? product.name : "Unknown Product";
  };

  const getOrderAmount = (orderId) => {
    if (!orderId) return "N/A";
    
    const order = orders.find((o) => o.order_id === orderId);
    
    // Check if order exists and total_amount is a valid number
    if (!order || typeof order.total_amount !== 'number') {
      return "N/A";
    }
    
    // Format the amount with 2 decimal places
    return `₱${order.total_amount.toFixed(2)}`;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      sx={{
        backgroundColor: "#e8eaf6",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar position="sticky" sx={{ backgroundColor: "#003580" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#fff" }}>
            Staff Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, display: "flex", justifyContent: "center", p: 4 }}>
        <Paper
          elevation={6}
          sx={{
            padding: { xs: 3, md: 6 },
            width: "100%",
            maxWidth: "1200px",
            borderRadius: 3,
            backgroundColor: "#fff",
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{ color: "#003580", fontWeight: "bold", mb: 3 }}
          >
            Transaction Management
          </Typography>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : transactions.length > 0 ? (
            <>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell><strong>Transaction ID</strong></TableCell>
                      <TableCell><strong>Order ID</strong></TableCell>
                      <TableCell><strong>Product</strong></TableCell>
                      <TableCell><strong>Quantity</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Order Amount</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((transaction) => (
                        <TableRow key={transaction.transaction_id}>
                          <TableCell>#{transaction.transaction_id}</TableCell>
                          <TableCell>
                            {transaction.order_id ? `#${transaction.order_id}` : "N/A"}
                          </TableCell>
                          <TableCell>{getProductName(transaction.product_id)}</TableCell>
                          <TableCell>{transaction.quantity || "N/A"}</TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.action_type}
                              color={
                                transaction.action_type === "Completed"
                                  ? "success"
                                  : transaction.action_type === "Pending"
                                  ? "warning"
                                  : "error"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.transaction_date).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                            })}
                          </TableCell>
                          <TableCell>{getOrderAmount(transaction.order_id)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={transactions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          ) : (
            <Typography align="center" sx={{ color: "#777", mt: 2 }}>
              No transactions found.
            </Typography>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Staff;