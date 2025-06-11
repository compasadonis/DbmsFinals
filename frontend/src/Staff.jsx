import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Typography, Button, Box, Paper, List, ListItem, ListItemText, Divider,
} from "@mui/material";
import axios from "axios";

const Staff = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [userRole, setRole] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Authentication & Role Check
  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");

    if (storedUser && storedRole) {
      setUser(storedUser);
      setRole(storedRole);

      if (storedRole !== "Staff") {
        navigate("/HomePage");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch customer list
  useEffect(() => {
    axios.get("http://localhost:5000/customers")
      .then((res) => {
        setCustomers(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch customers:", err);
      });
  }, []);

  // Fetch orders by customer
  const handleCustomerSelect = (customerId) => {
    setSelectedCustomer(customerId);
    axios.get(`http://localhost:5000/orders/${customerId}`)
      .then((res) => {
        setSelectedOrders(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        setSelectedOrders([]);
      });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ color: "#d32f2f", mb: 2 }}>
          Welcome {userRole} {user}
        </Typography>

        <Typography variant="h6" gutterBottom>
          Customer List
        </Typography>
        <List>
          {customers.map((customer) => (
            <ListItem
              key={customer.customer_id}
              button
              onClick={() => handleCustomerSelect(customer.customer_id)}
              sx={{ borderBottom: "1px solid #ddd" }}
            >
              <ListItemText
                primary={customer.full_name}
                secondary={`${customer.email} | ${customer.phone}`}
              />
            </ListItem>
          ))}
        </List>

        {selectedCustomer && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Orders for Customer ID: {selectedCustomer}
            </Typography>
            {selectedOrders.length === 0 ? (
              <Typography>No orders found.</Typography>
            ) : (
              <List>
                {selectedOrders.map((order) => (
                  <ListItem key={order.order_id}>
                    <ListItemText
                      primary={`Order #${order.order_id}`}
                      secondary={`Date: ${new Date(order.order_date).toLocaleString()} | Total: ₱${order.total_amount}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}

        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          sx={{ mt: 3 }}
        >
          Logout
        </Button>
      </Paper>
    </Container>
  );
};

export default Staff;
