import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Admin from "./Admin";
import Staff from "./Staff";
import ProductManagement from "./ProductManagement";
import HomePage from "./HomePage";
import CustomerInfo from "./CustomerInfo";  

function App() {
  return (
    <Router>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5", // Optional: Add a light background color
          padding: "20px", // Optional: Add padding for smaller screens
        }}
      >
        <div style={{ width: "100%", maxWidth: "500px" }}>
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/ProductManagement" element={<ProductManagement />} />
            <Route path="/homepage" element={<HomePage />} />
            <Route path="/customerinfo" element={<CustomerInfo />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
