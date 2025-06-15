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
  IconButton,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";

const Staff = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (!username || role !== "staff") {
      navigate("/");
    } else {
      fetchTransactions();
    }
  }, [navigate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/transactions");
      setTransactions(response.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch transactions.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Pending":
        return "warning";
      case "Failed":
        return "error";
      case "Reversed":
        return "secondary";
      default:
        return "default";
    }
  };

  const filteredTransactions = transactions
    .filter((transaction) => {
      if (filter === "all") return true;
      return transaction.transaction_type === filter;
    })
    .filter((transaction) => {
      if (!searchTerm) return true;
      return (
        transaction.transaction_id.toString().includes(searchTerm) ||
        transaction.payment_method?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  return (
    <Box sx={{ backgroundColor: "#e8eaf6", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* AppBar */}
      <AppBar position="sticky" sx={{ backgroundColor: "#003580" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#fff" }}>
            Transactions (for Staff)
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Paper elevation={6} sx={{ p: 3, borderRadius: 3, backgroundColor: "#fff" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h5" sx={{ color: "#003580", fontWeight: "bold" }}>
              Transaction Records
            </Typography>
            <Box>
              <IconButton onClick={fetchTransactions} sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
              <Button
                startIcon={<FilterListIcon />}
                onClick={() =>
                  setFilter(filter === "all" ? "Purchase" : filter === "Purchase" ? "Refund" : "all")
                }
                variant="outlined"
                sx={{ mr: 2 }}
              >
                {filter === "all" ? "All" : filter}
              </Button>
              <TextField
                size="small"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredTransactions.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Transactions</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Payment Method</strong></TableCell>
                    <TableCell><strong>Order Status</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((transaction, index) => (
                    <TableRow key={transaction.transaction_id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{transaction.transaction_type}</TableCell>
                      <TableCell>₱{parseFloat(transaction.amount).toFixed(2)}</TableCell>
                      <TableCell>{transaction.payment_method || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          color={getStatusColor(transaction.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDateTime(transaction.transaction_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography align="center" sx={{ color: "#777", py: 4 }}>
              No transactions found matching your criteria.
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Footer */}
      <Box component="footer" sx={{ backgroundColor: "#003580", color: "#fff", textAlign: "center", padding: 2 }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} My Business. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Staff;
