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
} from "@mui/material";
import axios from "axios";

const Admin = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [role, setRole] = useState("");

  const [sales, setSales] = useState({});
  const [inventory, setInventory] = useState({});
  const [transactions, setTransactions] = useState({});

  useEffect(() => {
    const username = localStorage.getItem("username");
    const userRole = localStorage.getItem("role");

    if (!username || !userRole) {
      navigate("/login");
    } else if (userRole !== "admin") {
      navigate("/a");
    } else {
      setUser(username);
      setRole(userRole);
      loadReports();
    }

    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-area, .print-area * {
          visibility: visible;
        }
        .print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 40px;
          background-color: white;
        }
        button {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
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
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handlePrint = () => {
    window.print();
  };

  const renderCard = (title, fields) => (
    <Card
      variant="outlined"
      sx={{
        mb: 4,
        borderRadius: 3,
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        backgroundColor: "#fff",
        px: 4,
        py: 3,
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          color="primary"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          {title}
        </Typography>
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
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", px: 6, py: 4 }}>
      <Box className="print-area">
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#333", mb: 2 }}
        >
          Welcome, Admin {user}
        </Typography>

        {/* Product Management Button BELOW Welcome */}
        <Box display="flex" justifyContent="center" mb={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/productmanagement")}
            sx={{ fontWeight: 600, fontSize: "1rem", px: 4, py: 1 }}
          >
            Go to Product Management
          </Button>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            {renderCard("Sales Report", [
              ["Total Sales Today", `${sales.total_sales_today ?? 0} PESOS`],
              ["Total Sales Week", `${sales.total_sales_week ?? 0} PESOS`],
              ["Total Sales Month", `${sales.total_sales_month ?? 0} PESOS`],
              ["Number of Orders Today", sales.number_of_orders_today ?? 0],
              ["Number of Orders This Week", sales.number_of_orders_week ?? 0],
            ])}
          </Grid>

          <Grid item xs={12}>
            {renderCard("Inventory Report", [
              ["Total Products", inventory.total_products ?? 0],
              ["Out of Stocks", inventory.out_of_stocks ?? 0],
              ["Low Stock Products", inventory.low_stock_product ?? 0],
              ["Most Stocked Product", inventory.most_stocked_product ?? "N/A"],
            ])}
          </Grid>

          <Grid item xs={12}>
            {renderCard("Transaction Report", [
              ["Total Transactions", transactions.total_transactions ?? 0],
              ["Pending Transactions", transactions.pending_transaction ?? 0],
              ["Completed Transactions", transactions.completed_transaction ?? 0],
              ["Refunded", transactions.refunded_transaction ?? 0],
            ])}
          </Grid>
        </Grid>
      </Box>

      <Box mt={4}>
        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={handleLogout}
          sx={{ py: 1.5, fontWeight: 600, fontSize: "1rem", mb: 2 }}
        >
          Logout
        </Button>

        <Button
          variant="outlined"
          color="primary"
          fullWidth
          onClick={handlePrint}
          sx={{ py: 1.5, fontWeight: 600, fontSize: "1rem" }}
        >
          Print Reports
        </Button>
      </Box>
    </Box>
  );
};

export default Admin;
