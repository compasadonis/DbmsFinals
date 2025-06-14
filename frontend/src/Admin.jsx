import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ReceiptIcon from "@mui/icons-material/Receipt";
import InventoryIcon from "@mui/icons-material/Inventory";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PrintIcon from "@mui/icons-material/Print";
import StoreIcon from "@mui/icons-material/Store";
import axios from "axios";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [role, setRole] = useState("");
  const [sales, setSales] = useState({});
  const [inventory, setInventory] = useState({});
  const [transactions, setTransactions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const userRole = localStorage.getItem("role");

    if (!username || !userRole) {
      navigate("/");
    } else if (userRole !== "admin") {
      navigate("/");
    } else {
      setUser(username);
      setRole(userRole);
      loadReports();
    }
  }, [navigate]);

  const loadReports = async () => {
    try {
      const [salesData, inventoryData, transactionData] = await Promise.all([
        axios.get("http://localhost:5000/api/reports/sales"),
        axios.get("http://localhost:5000/api/reports/inventory"),
        axios.get("http://localhost:5000/api/reports/transactions"),
      ]);

      setSales(salesData.data);
      setInventory(inventoryData.data);
      setTransactions(transactionData.data);
    } catch (err) {
      console.error("Error loading reports", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handlePrint = () => {
    window.print();
  };

  const goToProductManagement = () => {
    navigate("/productmanagement");
  };

  const renderCard = (title, fields, icon) => (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        px: 4,
        py: 3,
        backgroundColor: "#fff",
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography
            variant="h6"
            color="primary"
            gutterBottom
            sx={{ fontWeight: "bold", ml: 2 }}
          >
            {title}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {fields.map(([label, value], idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Typography variant="body1" sx={{ color: "#555" }}>
              {label}
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: "#111" }}>
              {value}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* AppBar */}
      <AppBar position="sticky" sx={{ backgroundColor: "#003580" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Admin Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: "#003580",
          color: "#fff",
          textAlign: "center",
          py: 5,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Welcome, Admin {user}
        </Typography>
        <Typography variant="subtitle1">
          Manage your platform efficiently with the tools below.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<StoreIcon />}
          onClick={goToProductManagement}
          sx={{
            mt: 3,
            fontWeight: "bold",
            fontSize: "1rem",
            px: 4,
            py: 1.5,
            borderRadius: 2,
          }}
        >
          Go to Product Management
        </Button>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1200, mx: "auto", py: 6 }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ minHeight: "50vh" }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              {renderCard(
                "Sales Report",
                [
                  ["Total Sales Today", `${sales.total_sales_today ?? 0} PESOS`],
                  ["Total Sales This Week", `${sales.total_sales_week ?? 0} PESOS`],
                  ["Number of Orders", sales.number_of_orders_today ?? 0],
                ],
                <ReceiptIcon color="primary" fontSize="large" />
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              {renderCard(
                "Inventory Report",
                [
                  ["Total Products", inventory.total_products ?? 0],
                  ["Out of Stock", inventory.out_of_stocks ?? 0],
                  ["Low Stock Products", inventory.low_stock_product ?? 0],
                ],
                <InventoryIcon color="primary" fontSize="large" />
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              {renderCard(
                "Transaction Report",
                [
                  ["Total Transactions", transactions.total_transactions ?? 0],
                  ["Pending Transactions", transactions.pending_transaction ?? 0],
                  ["Completed Transactions", transactions.completed_transaction ?? 0],
                ],
                <DashboardIcon color="primary" fontSize="large" />
              )}
            </Grid>
          </Grid>
        )}

        {/* Print Reports Button */}
        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: "bold",
              fontSize: "1rem",
              borderRadius: 2,
            }}
          >
            Print Reports
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Admin;
