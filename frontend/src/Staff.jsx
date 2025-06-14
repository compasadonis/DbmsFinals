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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Staff = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });

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
    const options = { weekday: "long", hour: "numeric", minute: "numeric", hour12: true };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <Box
      sx={{
        backgroundColor: "#e8eaf6",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* AppBar */}
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

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 6,
            width: "100%",
            maxWidth: 800,
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
            Transactions Table
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{ color: "#555", mb: 4 }}
          >
            View recent transactions below.
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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Transaction ID</strong></TableCell>
                    <TableCell><strong>Action Type</strong></TableCell>
                    <TableCell><strong>Transaction Date</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.transaction_id}>
                      <TableCell>{transaction.transaction_id}</TableCell>
                      <TableCell>{transaction.action_type}</TableCell>
                      <TableCell>{formatDateTime(transaction.transaction_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography align="center" sx={{ color: "#777", mt: 2 }}>
              No transactions found.
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
      <Box
        component="footer"
        sx={{
          backgroundColor: "#003580",
          color: "#fff",
          textAlign: "center",
          padding: 2,
        }}
      >
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} My Business. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Staff;
