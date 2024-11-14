import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignUpForm from "./components/SignUpPage";
import DashboardPage from "./components/DashboardPage";
import StudentDetailsForm from "./components/StudentProfile";
import ViewProfile from "./components/ViewProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/student-profile" element={<StudentDetailsForm />} />
        <Route path="/view-profile" element={<ViewProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
