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
const upload = multer({ storage: storage });

// MySQL connection pool
const db = mysql2.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "databasenicompas",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Check DB connection
db.getConnection((err) => {
  if (err) {
    console.error("Database connection failed", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// Register
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const checkUserSql = "SELECT * FROM register WHERE username = ?";
    db.query(checkUserSql, [username], (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      const insertUserSql = "INSERT INTO register (username, password, role) VALUES (?, ?, ?)";
      db.query(insertUserSql, [username, hashedPassword, role], (err) => {
        if (err) return res.status(500).json({ message: "Registration failed" });
        res.status(201).json({ message: "User registered successfully" });
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "SELECT * FROM register WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, username: user.username, role: user.role });
  });
});

// Sales Report Summary
app.get("/api/reports/sales", (req, res) => {
  const query = `
    SELECT
      total_sales_today,
      total_sales_week,
      total_sales_month,
      number_of_orders_today,
      number_of_orders_week
    FROM sales_report_view
    LIMIT 1
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching sales report", error: err });
    res.json(results[0] || {});
  });
});

// Inventory Report Summary
app.get("/api/reports/inventory", (req, res) => {
  const query = `
    SELECT
      total_products,
      out_of_stocks,
      low_stock_product,
      most_stocked_product
    FROM inventory_report_view
    LIMIT 1
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching inventory report", error: err });
    res.json(results[0] || {});
  });
});

// Transactions Report Summary
app.get("/api/reports/transactions", (req, res) => {
  const query = `
    SELECT
      total_transactions,
      pending_transaction,
      completed_transaction,
      refunded_transaction
    FROM transaction_report_view
    LIMIT 1
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching transaction report", error: err });
    res.json(results[0] || {});
  });
});

// Get all products
app.get("/api/products", (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching products", error: err });

    const formatted = results.map((product) => ({
      ...product,
      product_image: product.product_image
        ? Buffer.from(product.product_image).toString("base64")
        : null,
    }));

    res.json(formatted);
  });
});

// Add product
app.post("/api/products", upload.single("product_image"), (req, res) => {
  const { name, description, price, quantity, category_id } = req.body; // Use category_id
  const image = req.file ? req.file.buffer : null;

  if (!name || !description || !price || !quantity || !category_id) {
    return res.status(400).json({ message: "All fields including category_id are required" });
  }

  const sql =
    "INSERT INTO products (name, description, price, quantity, product_image, category_id) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [name, description, price, quantity, image, category_id], (err) => {
    if (err) return res.status(500).json({ message: "Error adding product", error: err });
    res.json({ message: "Product added successfully" });
  });
});

// Update product
app.put("/api/products/:id", upload.single("product_image"), (req, res) => {
  const { name, description, price, quantity, category_id } = req.body; // Use category_id
  const image = req.file ? req.file.buffer : null;
  const { id } = req.params;

  if (!name || !description || !price || !quantity || !category_id) {
    return res.status(400).json({ message: "All fields including category_id are required" });
  }

  let sql, values;
  if (image) {
    sql =
      "UPDATE products SET name = ?, description = ?, price = ?, quantity = ?, product_image = ?, category_id = ? WHERE product_id = ?";
    values = [name, description, price, quantity, image, category_id, id];
  } else {
    sql =
      "UPDATE products SET name = ?, description = ?, price = ?, quantity = ?, category_id = ? WHERE product_id = ?";
    values = [name, description, price, quantity, category_id, id];
  }

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ message: "Error updating product", error: err });
    res.json({ message: "Product updated successfully" });
  });
});

// Get all categories
app.get("/api/category", (req, res) => {
  const sql = "SELECT category_id, type_of_category FROM category";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching category", error: err });
    }
    res.json(results);
  });
});
// Customer Registration
app.post("/api/register-customers", async (req, res) => {
  const { username, password, full_name, email, phone, address } = req.body;

  if (!username || !password || !full_name || !email || !phone || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if username already exists
    const checkUserSql = "SELECT * FROM register WHERE username = ?";
    db.query(checkUserSql, [username], async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert into the register table
      const insertRegisterSql =
        "INSERT INTO register (username, password, role) VALUES (?, ?, 'user')";
      db.query(insertRegisterSql, [username, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: "Registration failed" });

        const registerId = result.insertId;

        // Insert into the customers table
        const insertCustomerSql =
          "INSERT INTO customers (customer_id, full_name, email, phone, address) VALUES (?, ?, ?, ?, ?)";
        db.query(
          insertCustomerSql,
          [registerId, full_name, email, phone, address],
          (err) => {
            if (err) {
              return res.status(500).json({ message: "Failed to create customer details" });
            }
            res.status(201).json({ message: "Customer registered successfully!" });
          }
        );
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});