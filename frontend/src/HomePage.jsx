import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  TextField,
  MenuItem,
  Container,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/category");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Container
      maxWidth="lg"
      sx={{
        backgroundColor: "#fff",
        border: "1px solid #d32f2f",
        borderRadius: "8px",
        padding: "30px",
        marginTop: "30px",
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#d32f2f" }}
      >
        Welcome to Our Store
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "center",
          mt: 4,
          mb: 4,
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
          InputLabelProps={{ style: { color: "#d32f2f" } }}
        />
        <TextField
          select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          variant="outlined"
          sx={{ minWidth: 200 }}
          InputLabelProps={{ style: { color: "#d32f2f" } }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.category_id} value={cat.category_id}>
              {cat.type_of_category}
            </MenuItem>
          ))}
        </TextField>

        <IconButton
          sx={{
            backgroundColor: "#ffebee",
            color: "#d32f2f",
            "&:hover": { backgroundColor: "#ffcdd2" },
          }}
          onClick={() => alert("Go to Cart!")}
        >
          <ShoppingCartIcon />
        </IconButton>

        <IconButton
          sx={{
            backgroundColor: "#ffebee",
            color: "#d32f2f",
            "&:hover": { backgroundColor: "#ffcdd2" },
          }}
          onClick={() => navigate("/customerinfo")}
        >
          <PersonIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={product.product_id}
            >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: 2,
                  borderRadius: 2,
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={
                    product.product_image
                      ? `data:image/jpeg;base64,${product.product_image}`
                      : "https://via.placeholder.com/150"
                  }
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {product.description}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ marginTop: "10px", color: "#d32f2f" }}
                  >
                    ₱{parseFloat(product.price).toFixed(2)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton sx={{ color: "#d32f2f" }} aria-label="add to cart">
                    <AddShoppingCartIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No products found.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default HomePage;
