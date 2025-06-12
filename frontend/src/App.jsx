import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import CustomerRegister from "./CustomerRegister";
import Admin from "./Admin";
import Staff from "./Staff";
import ProductManagement from "./ProductManagement";
import HomePage from "./HomePage";
import CustomerInfo from "./CustomerInfo";
import Register from "./Register";

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
          <Route path="/customerinfo" element={<CustomerInfo />} />
        </Routes>
      
    </Router>
  );
}

export default App;
