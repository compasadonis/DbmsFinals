import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";

const ProductManagement = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [role, setRole] = useState("");
  const [products, setProducts] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    product_id: null,
    name: "",
    description: "",
    price: "",
    quantity: "",
    product_image: null, // now a File object
  });

  useEffect(() => {
    const username = localStorage.getItem("username");
    const userRole = localStorage.getItem("role");

    if (!username || !userRole) {
      navigate("/login");
    } else if (userRole !== "Admin") {
      navigate("/staff");
    } else {
      setUser(username);
      setRole(userRole);
      loadProducts();
    }
  }, [navigate]);

  const loadProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  const handleAddProduct = () => {
    setIsEditMode(false);
    setCurrentProduct({
      product_id: null,
      name: "",
      description: "",
      price: "",
      quantity: "",
      product_image: null,
    });
    setOpenDialog(true);
  };

  const handleEditProduct = (product) => {
    setIsEditMode(true);
    setCurrentProduct({
      ...product,
      product_image: null, // don't prefill with blob
    });
    setOpenDialog(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentProduct((prev) => ({ ...prev, product_image: file }));
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", currentProduct.name);
      formData.append("description", currentProduct.description);
      formData.append("price", currentProduct.price);
      formData.append("quantity", currentProduct.quantity);
      if (currentProduct.product_image) {
        formData.append("product_image", currentProduct.product_image);
      }

      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/products/${currentProduct.product_id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        await axios.post("http://localhost:5000/api/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setOpenDialog(false);
      loadProducts();
    } catch (err) {
      console.error("Failed to save product:", err);
    }
  };

  const handleDeleteProduct = async (product_id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${product_id}`);
      loadProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", px: 6, py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#333", mb: 2 }}>
        Welcome, Admin {user}
      </Typography>

      <Box display="flex" justifyContent="center" mb={4}>
        <Button variant="contained" color="primary" onClick={() => navigate("/admin")} sx={{ fontWeight: 600, fontSize: "1rem", px: 4, py: 1 }}>
          Back to Admin Dashboard
        </Button>
      </Box>

      <Card sx={{ mb: 4, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Product Management
          </Typography>
          <Button variant="contained" color="primary" onClick={handleAddProduct}>
            Add Product
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Number</TableCell>
                <TableCell sx={{ color: "white" }}>Image</TableCell>
                <TableCell sx={{ color: "white" }}>Name</TableCell>
                <TableCell sx={{ color: "white" }}>Description</TableCell>
                <TableCell sx={{ color: "white" }}>Price</TableCell>
                <TableCell sx={{ color: "white" }}>Quantity</TableCell>
                <TableCell sx={{ color: "white" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell>{product.product_id}</TableCell>
                    <TableCell>
                      {product.product_image ? (
                        <img
                          src={`data:image/jpeg;base64,${product.product_image}`}
                          alt={product.name}
                          width={50}
                          height={50}
                          style={{ objectFit: "cover", borderRadius: 4 }}
                        />
                      ) : (
                        "No Image"
                      )}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>{parseFloat(product.price).toFixed(2)}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEditProduct(product)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteProduct(product.product_id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Button variant="contained" color="error" fullWidth onClick={handleLogout} sx={{ py: 1.5, fontWeight: 600, fontSize: "1rem", mb: 2 }}>
        Logout
      </Button>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent dividers>
          <TextField margin="normal" label="Name" name="name" fullWidth value={currentProduct.name} onChange={handleChange} />
          <TextField margin="normal" label="Description" name="description" fullWidth multiline rows={3} value={currentProduct.description} onChange={handleChange} />
          <TextField margin="normal" label="Price" name="price" type="number" fullWidth inputProps={{ step: "0.01", min: 0 }} value={currentProduct.price} onChange={handleChange} />
          <TextField margin="normal" label="Quantity" name="quantity" type="number" fullWidth inputProps={{ min: 0 }} value={currentProduct.quantity} onChange={handleChange} />

          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            Upload Image
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
          </Button>
          {currentProduct.product_image && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {currentProduct.product_image.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {isEditMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;
