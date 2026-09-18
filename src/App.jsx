import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ReportIssue from "./pages/ReportIssue";
import MyComplaints from "./pages/MyComplaints";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/report" element={<ReportIssue />} />

        <Route path="/complaints" element={<MyComplaints />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;