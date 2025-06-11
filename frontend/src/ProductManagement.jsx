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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";

const ProductManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    product_id: null,
    name: "",
    description: "",
    price: "",
    quantity: "",
    category_id: "",
    product_image: null,
  });

  useEffect(() => {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (!username || role !== "Admin") {
      navigate("/login");
    } else {
      setUser(username);
      loadProducts();
      loadCategories();
    }
  }, [navigate]);

  const loadProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/category");
      setCategories(res.data);
    } catch (err) {
      console.error("Error loading categories:", err);
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
      category_id: "",
      product_image: null,
    });
    setOpenDialog(true);
  };

  const handleEditProduct = (product) => {
    setIsEditMode(true);
    setCurrentProduct({
      product_id: product.product_id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      category_id: product.category_id,
      product_image: null,
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
    const formData = new FormData();
    formData.append("name", currentProduct.name);
    formData.append("description", currentProduct.description);
    formData.append("price", currentProduct.price);
    formData.append("quantity", currentProduct.quantity);
    formData.append("category_id", currentProduct.category_id);
    if (currentProduct.product_image) {
      formData.append("product_image", currentProduct.product_image);
    }

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/products/${currentProduct.product_id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/products",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      setOpenDialog(false);
      loadProducts();
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      loadProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", px: 6, py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold", color: "black" }}>
  Welcome, Admin {user}
</Typography>


      <Box display="flex" justifyContent="center" mb={4}>
        <Button variant="contained" color="primary" onClick={() => navigate("/admin")}>
          Back to Admin Dashboard
        </Button>
      </Box>

      <Card sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Product Management</Typography>
          <Button variant="contained" onClick={handleAddProduct}>Add Product</Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>#</TableCell>
                <TableCell sx={{ color: "white" }}>Image</TableCell>
                <TableCell sx={{ color: "white" }}>Name</TableCell>
                <TableCell sx={{ color: "white" }}>Description</TableCell>
                <TableCell sx={{ color: "white" }}>Price</TableCell>
                <TableCell sx={{ color: "white" }}>Quantity</TableCell>
                <TableCell sx={{ color: "white" }}>Category</TableCell>
                <TableCell sx={{ color: "white" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">No products found.</TableCell>
                </TableRow>
              ) : (
                products.map((p) => {
                  const category = categories.find(c => c.category_id === p.category_id);
                  return (
                    <TableRow key={p.product_id}>
                      <TableCell>{p.product_id}</TableCell>
                      <TableCell>
                        {p.product_image ? (
                          <img
                            src={`data:image/jpeg;base64,${p.product_image}`}
                            alt={p.name}
                            width={50}
                            height={50}
                            style={{ objectFit: "cover", borderRadius: 4 }}
                          />
                        ) : "No Image"}
                      </TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.description}</TableCell>
                      <TableCell>{parseFloat(p.price).toFixed(2)}</TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell>{category?.type_of_category || "–"}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleEditProduct(p)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteProduct(p.product_id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Button variant="contained" color="error" fullWidth sx={{ mt: 4 }} onClick={handleLogout}>
        Logout
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent dividers>
          <TextField label="Name" name="name" fullWidth margin="normal" value={currentProduct.name} onChange={handleChange} />
          <TextField label="Description" name="description" fullWidth margin="normal" multiline rows={3} value={currentProduct.description} onChange={handleChange} />
          <TextField label="Price" name="price" type="number" fullWidth margin="normal" value={currentProduct.price} onChange={handleChange} />
          <TextField label="Quantity" name="quantity" type="number" fullWidth margin="normal" value={currentProduct.quantity} onChange={handleChange} />

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select name="category_id" value={currentProduct.category_id} onChange={handleChange}>
              {categories.map(c => (
                <MenuItem key={c.category_id} value={c.category_id}>
                  {c.type_of_category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
