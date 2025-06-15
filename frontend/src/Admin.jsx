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
  Chip,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ReceiptIcon from "@mui/icons-material/Receipt";
import InventoryIcon from "@mui/icons-material/Inventory";
import PrintIcon from "@mui/icons-material/Print";
import StoreIcon from "@mui/icons-material/Store";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import axios from "axios";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [role, setRole] = useState("");
  const [sales, setSales] = useState({});
  const [inventory, setInventory] = useState({
    total_products: 0,
    out_of_stocks: 0,
    low_stock_product: 0,
    most_stocked_product: "N/A",
    most_stocked_quantity: 0,
  });
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
      const [salesData, inventoryData] = await Promise.all([
        axios.get("http://localhost:5000/api/reports/sales"),
        axios.get("http://localhost:5000/api/reports/inventory"),
      ]);

      setSales(salesData.data);
      setInventory({
        ...inventoryData.data,
        total_products: inventoryData.data?.total_products || 0,
        out_of_stocks: inventoryData.data?.out_of_stocks || 0,
        low_stock_product: inventoryData.data?.low_stock_product || 0,
        most_stocked_product: inventoryData.data?.most_stocked_product || "N/A",
        most_stocked_quantity: inventoryData.data?.most_stocked_quantity || 0,
      });
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
        height: "100%",
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
        {fields.map(([label, value, isChip], idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1.5,
              alignItems: "center",
            }}
          >
            <Typography variant="body1" sx={{ color: "#555" }}>
              {label}
            </Typography>
            {isChip ? (
              <Chip 
                label={value} 
                color={value === "N/A" ? "default" : "primary"}
                variant="outlined"
              />
            ) : (
              <Typography variant="body1" fontWeight="bold" sx={{ color: "#111" }}>
                {value}
              </Typography>
            )}
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
          <Box display="flex" alignItems="center">
            <LocalMallIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Admin Dashboard
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", ml: 2 }}>
            
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} title="Logout">
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
          px: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Welcome, {user}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          Manage your store efficiently
        </Typography>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<StoreIcon />}
            onClick={goToProductManagement}
            sx={{
              fontWeight: "bold",
              fontSize: "1rem",
              px: 4,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Product Management
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              fontWeight: "bold",
              fontSize: "1rem",
              px: 4,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Print Reports
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1200, mx: "auto", py: 6, px: 2 }}>
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
            <Grid item xs={12} md={6}>
              {renderCard(
                "Sales Report",
                [
                  ["Total Sales Today", `₱${sales.total_sales_today?.toLocaleString() || 0}`, false],
                  ["Weekly Sales", `₱${sales.total_sales_week?.toLocaleString() || 0}`, false],
                  ["Today's Orders", sales.number_of_orders_today || 0, false],
                ],
                <ReceiptIcon color="primary" fontSize="large" />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderCard(
                "Inventory Report",
                [
                  ["Total Products", inventory.total_products || 0, false],
                  ["Out of Stock", inventory.out_of_stocks || 0, false],
                  ["Low Stock Items", inventory.low_stock_product || 0, false],
                  ["Most Stocked Product", inventory.most_stocked_product || "N/A", true],
                ],
                <InventoryIcon color="primary" fontSize="large" />
              )}
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Admin;
