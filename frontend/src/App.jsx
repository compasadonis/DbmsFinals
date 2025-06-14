import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import CustomerRegister from "./CustomerRegister";
import Admin from "./Admin";
import Staff from "./Staff";
import ProductManagement from "./ProductManagement";
import HomePage from "./HomePage";
import CustomerCart from "./CustomerCart";
import Register from "./Register";
import Receipt from "./Receipt";
import Testing from "./Testing"; // Import Testing component if needed

function App() {
  return (
    <Router>
      
        {/* Inside each page/component, you can constrain width as needed */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/customerregister" element={<CustomerRegister />} />

          {/* Authenticated Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/productmanagement" element={<ProductManagement />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/customercart" element={<CustomerCart />} />
          <Route path="/receipt" element={<Receipt />} />
          <Route path="/testing" element={<Testing />} />

        </Routes>
      
    </Router>
  );
}

export default App;