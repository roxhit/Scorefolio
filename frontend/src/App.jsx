import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignUpForm from "./components/SignUpPage";
import DashboardPage from "./components/DashboardPage";
import StudentDetailsForm from "./components/StudentProfile";
import ViewProfile from "./components/ViewProfile";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import UpcomingCompaniesPage from "./components/UpcomingCompaniespage";
import CompaniesManagement from "./components/CompaniesManagement";
import ScorefolioHomePage from "./components/HomePage";
import EditProfile from "./components/EditProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScorefolioHomePage />} />
        <Route path="/student-login" element={<LoginPage />} />
        <Route path="/student-signup" element={<SignUpForm />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/student-profile" element={<StudentDetailsForm />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/view-profile" element={<ViewProfile />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/upcoming-companies" element={<UpcomingCompaniesPage />} />
        <Route path="/comapnies" element={<CompaniesManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
