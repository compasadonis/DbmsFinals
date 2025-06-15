const express = require("express");
const mysql2 = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Multer setup for image upload (in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// MySQL connection pool
const db = mysql2.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "databasenicompas",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Check DB connection
db.getConnection((err) => {
  if (err) console.error("Database connection failed", err);
  else console.log("Connected to MySQL database");
});

// ---- Authentication Endpoints ----

// Register
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const checkUserSql = "SELECT * FROM register WHERE username = ?";
    db.query(checkUserSql, [username], (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length)
        return res.status(400).json({ message: "User already exists" });

      const insertUserSql =
        "INSERT INTO register (username, password, role) VALUES (?, ?, ?)";
      db.query(insertUserSql, [username, hashedPassword, role], (err) => {
        if (err) return res.status(500).json({ message: "Registration failed" });
        res.status(201).json({ message: "User registered successfully" });
      });
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "All fields are required" });

  const sql = "SELECT * FROM register WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err || !results.length)
      return res.status(400).json({ message: "Invalid username or password" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid username or password" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, username: user.username, role: user.role });
  });
});

// ---- Report Endpoints ----

// Sales Report
app.get("/api/reports/sales", (req, res) => {
  const q = `SELECT total_sales_today, total_sales_week, total_sales_month, number_of_orders_today, number_of_orders_week FROM sales_report_view LIMIT 1`;
  db.query(q, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching sales report", error: err });
    res.json(results[0] || {});
  });
});

// Inventory Report
app.get("/api/reports/inventory", (req, res) => {
  const q = `SELECT total_products, out_of_stocks, low_stock_product, most_stocked_product FROM inventory_report_view LIMIT 1`;
  db.query(q, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching inventory report", error: err });
    res.json(results[0] || {});
  });
});

// Transactions Report
app.get("/api/reports/transactions", (req, res) => {
  const q = `SELECT total_transactions, pending_transaction, completed_transaction, refunded_transaction FROM transaction_report_view LIMIT 1`;
  db.query(q, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching transaction report", error: err });
    res.json(results[0] || {});
  });
});

// ---- Category Endpoints ----
app.get("/api/category", (req, res) => {
  const sql = "SELECT category_id, type_of_category FROM category";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching category", error: err });
    res.json(results);
  });
});

// ---- Product Endpoints ----

// Get all products
app.get("/api/products", (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching products", error: err });
    const formatted = results.map(p => ({
      ...p,
      product_image: p.product_image ? Buffer.from(p.product_image).toString("base64") : null
    }));
    res.json(formatted);
  });
});

// Add product
app.post("/api/products", upload.single("product_image"), (req, res) => {
  const { name, description, price, quantity, category_id } = req.body;
  const image = req.file ? req.file.buffer : null;
  if (!name || !description || !price || !quantity || !category_id)
    return res.status(400).json({ message: "All fields including category_id are required" });

  const sql = "INSERT INTO products (name, description, price, quantity, product_image, category_id) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [name, description, price, quantity, image, category_id], err => {
    if (err) return res.status(500).json({ message: "Error adding product", error: err });
    res.json({ message: "Product added successfully" });
  });
});

// Update product
app.put("/api/products/:id", upload.single("product_image"), (req, res) => {
  const { name, description, price, quantity, category_id } = req.body;
  const image = req.file ? req.file.buffer : null;
  const { id } = req.params;
  if (!name || !description || !price || !quantity || !category_id)
    return res.status(400).json({ message: "All fields including category_id are required" });

  let sql, vals;
  if (image) {
    sql = "UPDATE products SET name=?, description=?, price=?, quantity=?, product_image=?, category_id=? WHERE product_id=?";
    vals = [name, description, price, quantity, image, category_id, id];
  } else {
    sql = "UPDATE products SET name=?, description=?, price=?, quantity=?, category_id=? WHERE product_id=?";
    vals = [name, description, price, quantity, category_id, id];
  }
  db.query(sql, vals, err => {
    if (err) return res.status(500).json({ message: "Error updating product", error: err });
    res.json({ message: "Product updated successfully" });
  });
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
  db.query("DELETE FROM products WHERE product_id = ?", [req.params.id], err => {
    if (err) return res.status(500).json({ message: "Error deleting product", error: err });
    res.json({ message: "Product deleted successfully" });
  });
});

// ---- Customer Registration ----
app.post("/api/register-customers", async (req, res) => {
  const { username, password, full_name, email, phone, address } = req.body;
  if (!username || !password || !full_name || !email || !phone || !address)
    return res.status(400).json({ message: "All fields are required" });
  try {
    const checkUserSql = "SELECT * FROM register WHERE username = ?";
    db.query(checkUserSql, [username], async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length) return res.status(400).json({ message: "Username already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      db.query("INSERT INTO register (username, password, role) VALUES (?, ?, 'user')", [username, hashedPassword], (err, regRes) => {
        if (err) return res.status(500).json({ message: "Registration failed" });
        db.query(
          "INSERT INTO customers (customer_id, full_name, email, phone, address) VALUES (?, ?, ?, ?, ?)",
          [regRes.insertId, full_name, email, phone, address], err => {
            if (err) return res.status(500).json({ message: "Failed to create customer details" });
            res.status(201).json({ message: "Customer registered successfully!" });
          }
        );
      });
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ---- Cart Endpoints ----

// Add to cart
app.post("/api/cart", (req, res) => {
  let { customer_id, product_id, quantity } = req.body;
  customer_id = customer_id || 1;
  if (!product_id || !quantity)
    return res.status(400).json({ message: "Product ID and quantity are required" });

  db.query("SELECT 1 FROM products WHERE product_id=?", [product_id], (err, prodResults) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (!prodResults.length) return res.status(404).json({ message: "Product not found" });

    db.query(
      "SELECT * FROM cart WHERE customer_id=? AND product_id=?", [customer_id, product_id],
      (err, cartResults) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (cartResults.length) {
          const newQty = cartResults[0].quantity + quantity;
          db.query("UPDATE cart SET quantity=? WHERE cart_id=?", [newQty, cartResults[0].cart_id], err => {
            if (err) return res.status(500).json({ message: "Error updating cart" });
            res.json({ message: "Cart quantity updated successfully" });
          });
        } else {
          db.query("INSERT INTO cart (customer_id, product_id, quantity) VALUES (?, ?, ?)", [customer_id, product_id, quantity], err => {
            if (err) return res.status(500).json({ message: "Error adding to cart" });
            res.status(201).json({ message: "Product added to cart successfully" });
          });
        }
      }
    );
  });
});

// Get cart items
app.get("/api/cart/:customer_id", (req, res) => {
  const cid = req.params.customer_id || 1;
  const sql = `
    SELECT c.cart_id, c.quantity, p.product_id, p.name, p.description, p.price, p.product_image
    FROM cart c JOIN products p ON c.product_id = p.product_id WHERE c.customer_id = ?
  `;
  db.query(sql, [cid], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching cart items", error: err });
    const formatted = results.map(i => ({
      ...i,
      product_image: i.product_image ? Buffer.from(i.product_image).toString("base64") : null
    }));
    res.json(formatted);
  });
});

// Update the quantity of a cart item
app.put("/api/cart/update-quantity/:cart_id", (req, res) => {
  const cartId = req.params.cart_id;
  const { quantity } = req.body;
  const sql = "UPDATE cart SET quantity = ? WHERE cart_id = ?";
  db.query(sql, [quantity, cartId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error updating cart quantity", error: err });
    res.json({ message: "Cart quantity updated" });
  });
});

// Remove item
app.delete("/api/cart/:cart_id", (req, res) => {
  db.query("DELETE FROM cart WHERE cart_id=?", [req.params.cart_id], err => {
    if (err) return res.status(500).json({ message: "Error removing item from cart", error: err });
    res.json({ message: "Item removed from cart successfully" });
  });
});

// Clear cart
app.delete("/api/cart/clear/:customer_id", (req, res) => {
  const cid = req.params.customer_id || 1;
  db.query("DELETE FROM cart WHERE customer_id=?", [cid], err => {
    if (err) return res.status(500).json({ message: "Error clearing cart", error: err });
    res.json({ message: "Cart cleared successfully" });
  });
});

// ---- Checkout Endpoint ----
app.post("/api/orders", (req, res) => {
  const { customer_id, total_amount } = req.body;
  db.query(
    "INSERT INTO orders (customer_id, order_date, total_amount) VALUES (?, NOW(), ?)",
    [customer_id, total_amount], (err, orderRes) => {
      if (err) return res.status(500).json({ message: "Error creating order", error: err });
      res.json({ order_id: orderRes.insertId });
    }
  );
});

app.post("/api/order-items", (req, res) => {
  const { order_id, product_id, quantity, price } = req.body;
  db.query(
    "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
    [order_id, product_id, quantity, price], err => {
      if (err) return res.status(500).json({ message: "Error adding order item", error: err });
      res.json({ message: "Order item added successfully" });
    }
  );
});

// ---- Transactions Endpoints ----

// Add a transaction
app.post("/api/transactions", (req, res) => {
  const { order_id, payment_id, transaction_type, status, amount } = req.body;
  
  // Validate required fields
  if (!order_id || !payment_id || !transaction_type || !status || !amount) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate transaction type
  const validTypes = ['Purchase', 'Refund', 'Void', 'Adjustment'];
  if (!validTypes.includes(transaction_type)) {
    return res.status(400).json({ message: "Invalid transaction type" });
  }

  // Validate status
  const validStatuses = ['Pending', 'Completed', 'Failed', 'Reversed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  // Validate amount
  if (isNaN(amount) || amount === 0) {
    return res.status(400).json({ message: "Amount must be a non-zero number" });
  }

  const sql = `
    INSERT INTO transactions 
    (order_id, payment_id, transaction_type, status, amount, transaction_date, last_updated) 
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `;
  
  db.query(sql, [order_id, payment_id, transaction_type, status, amount], (err, result) => {
    if (err) return res.status(500).json({ message: "Error creating transaction", error: err });
    res.status(201).json({ 
      message: "Transaction created successfully", 
      transaction_id: result.insertId 
    });
  });
});

// Get all transactions

app.get("/api/transactions", (req, res) => {
  const sql = `
    SELECT t.transaction_id, t.transaction_type, t.amount, t.transaction_date,
           p.payment_method, o.status
    FROM transactions t
    LEFT JOIN payments p ON t.payment_id = p.payment_id
    LEFT JOIN orders o ON t.order_id = o.order_id
    ORDER BY t.transaction_date ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Get transaction by ID
app.get("/api/transactions/:transaction_id", (req, res) => {
  const { transaction_id } = req.params;
  const sql = `
    SELECT t.*, o.order_number, p.payment_method 
    FROM transactions t
    LEFT JOIN orders o ON t.order_id = o.order_id
    LEFT JOIN payments p ON t.payment_id = p.payment_id
    WHERE t.transaction_id = ?
  `;
  
  db.query(sql, [transaction_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching transaction", error: err });
    if (results.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json(results[0]);
  });
});

// Get transactions by order
app.get("/api/transactions/order/:order_id", (req, res) => {
  const { order_id } = req.params;
  const sql = `
    SELECT t.*, o.order_number, p.payment_method 
    FROM transactions t
    LEFT JOIN orders o ON t.order_id = o.order_id
    LEFT JOIN payments p ON t.payment_id = p.payment_id
    WHERE t.order_id = ?
    ORDER BY t.transaction_date DESC
  `;
  
  db.query(sql, [order_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching order transactions", error: err });
    res.json(results);
  });
});

// Get transactions by payment
app.get("/api/transactions/payment/:payment_id", (req, res) => {
  const { payment_id } = req.params;
  const sql = `
    SELECT t.*, o.order_number, p.payment_method 
    FROM transactions t
    LEFT JOIN orders o ON t.order_id = o.order_id
    LEFT JOIN payments p ON t.payment_id = p.payment_id
    WHERE t.payment_id = ?
    ORDER BY t.transaction_date DESC
  `;
  
  db.query(sql, [payment_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching payment transactions", error: err });
    res.json(results);
  });
});

// Get transactions by type
app.get("/api/transactions/type/:transaction_type", (req, res) => {
  const { transaction_type } = req.params;
  const sql = `
    SELECT t.*, o.order_number, p.payment_method 
    FROM transactions t
    LEFT JOIN orders o ON t.order_id = o.order_id
    LEFT JOIN payments p ON t.payment_id = p.payment_id
    WHERE t.transaction_type = ?
    ORDER BY t.transaction_date DESC
  `;
  
  db.query(sql, [transaction_type], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching transactions by type", error: err });
    res.json(results);
  });
});

// Update a transaction
app.put("/api/transactions/:transaction_id", (req, res) => {
  const { transaction_id } = req.params;
  const { status, amount } = req.body;

  // Validate status if provided
  if (status) {
    const validStatuses = ['Pending', 'Completed', 'Failed', 'Reversed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
  }

  // Validate amount if provided
  if (amount && (isNaN(amount) || amount === 0)) {
    return res.status(400).json({ message: "Amount must be a non-zero number" });
  }

  const updates = [];
  const values = [];

  if (status) {
    updates.push("status = ?");
    values.push(status);
  }

  if (amount) {
    updates.push("amount = ?");
    values.push(amount);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  values.push(transaction_id);

  const sql = `
    UPDATE transactions 
    SET ${updates.join(", ")}, last_updated = NOW()
    WHERE transaction_id = ?
  `;
  
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ message: "Error updating transaction", error: err });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json({ message: "Transaction updated successfully" });
  });
});

// Delete a transaction (use with caution)
app.delete("/api/transactions/:transaction_id", (req, res) => {
  const { transaction_id } = req.params;
  const sql = "DELETE FROM transactions WHERE transaction_id = ?";
  
  db.query(sql, [transaction_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error deleting transaction", error: err });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json({ message: "Transaction deleted successfully" });
  });
});
// Get all payments
app.get("/api/payments", async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM payments ORDER BY payment_date DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

app.post("/api/payments", (req, res) => {
  const { order_id, payment_method, payment_status } = req.body;
  if (!order_id || !payment_method || !payment_status) {
    return res.status(400).json({ message: "Missing payment fields" });
  }

  const sql = "INSERT INTO payments (order_id, payment_method, payment_status, payment_date) VALUES (?, ?, ?, NOW())";
  db.query(sql, [order_id, payment_method, payment_status], (err, result) => {
    if (err) return res.status(500).json({ message: "Error recording payment", error: err });
    res.status(201).json({ message: "Payment recorded", payment_id: result.insertId });
  });
});

// Get products
app.get("/api/products", (req, res) => {
db.query("SELECT product_id, name, quantity FROM products", (err, result) => {
if (err) return res.status(500).json({ error: err });
res.json(result);
});
});

// Reduce product quantity by a specified amount
app.put("/api/products/reduce/:id", (req, res) => {
  const productId = req.params.id;
  const { quantity } = req.body; // amount to reduce

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: "Quantity to reduce must be a positive number." });
  }

  // Update only if enough stock is available
  db.query(
    "UPDATE products SET quantity = quantity - ? WHERE product_id = ? AND quantity >= ?",
    [quantity, productId, quantity],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) {
        return res.status(400).json({ message: "Out of stock or insufficient quantity available." });
      }
      res.json({ message: "Quantity reduced successfully." });
    }
  );
});

app.get("/api/orders", (req, res) => {
  const query = "SELECT order_id, customer_id, order_date, total_amount FROM orders";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({
        message: "Error fetching orders",
        error: err.message,
      });
    }
    // Convert total_amount from string to number
    const formattedResults = results.map(order => ({
      ...order,
      total_amount: Number(order.total_amount)
    }));
    res.json(formattedResults);
  });
});

app.put("/api/products/adjust/:product_id", (req, res) => {
  const { product_id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 0) {
    return res.status(400).json({ message: "Invalid quantity provided." });
  }

  const sql = "UPDATE products SET quantity = ? WHERE product_id = ?";
  db.query(sql, [quantity, product_id], (err) => {
    if (err) return res.status(500).json({ message: "Error updating product quantity.", error: err });
    res.json({ message: "Product quantity successfully adjusted." });
  });
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
