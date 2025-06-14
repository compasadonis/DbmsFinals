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
  Divider,
  CircularProgress,
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
  const [loading, setLoading] = useState(true);
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

    if (!username || role !== "admin") {
      navigate("/");
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
    } finally {
      setLoading(false);
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
        await axios.post("http://localhost:5000/api/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
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

  const renderCard = (title, children) => (
    <Card
      elevation={3}
      sx={{
        mb: 4,
        borderRadius: 3,
        px: 4,
        py: 3,
        backgroundColor: "#fff",
      }}
    >
      <Typography
        variant="h6"
        color="primary"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Card>
  );

  return (
    <Box
      sx={{
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          maxWidth: 1200,
          width: "100%",
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#003580", mb: 4 }}
        >
          Product Management
        </Typography>

        <Box display="flex" justifyContent="center" mb={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/admin")}
            sx={{ fontWeight: "bold", fontSize: "1rem", px: 4, py: 1 }}
          >
            Back to Admin Dashboard
          </Button>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          renderCard("Products List", (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => {
                      const category = categories.find(
                        (cat) => cat.category_id === product.category_id
                      );
                      return (
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
                          <TableCell>{product.price}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell>{category?.type_of_category || "N/A"}</TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleEditProduct(product)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteProduct(product.product_id)}
                            >
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
          ))
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleAddProduct}
          sx={{ mt: 4, fontWeight: "bold", py: 1.5, fontSize: "1rem" }}
        >
          Add New Product
        </Button>

        <Button
          variant="contained"
          color="error"
          fullWidth
          sx={{ mt: 2, fontWeight: "bold", py: 1.5, fontSize: "1rem" }}
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          Logout
        </Button>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Name"
            name="name"
            fullWidth
            margin="normal"
            value={currentProduct.name}
            onChange={handleChange}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={currentProduct.description}
            onChange={handleChange}
          />
          <TextField
            label="Price"
            name="price"
            type="number"
            fullWidth
            margin="normal"
            value={currentProduct.price}
            onChange={handleChange}
          />
          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            fullWidth
            margin="normal"
            value={currentProduct.quantity}
            onChange={handleChange}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              name="category_id"
              value={currentProduct.category_id}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <MenuItem key={category.category_id} value={category.category_id}>
                  {category.type_of_category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
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
