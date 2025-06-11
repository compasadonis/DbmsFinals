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
      <div
  
      >
        <div style={{ width: "100%", maxWidth: "500px" }}>
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
        </div>
      </div>
    </Router>
  );
}

export default App;
