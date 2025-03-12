/////////////////////////////////////////////
//Dépendances
import { Routes, Route } from "react-router-dom";

/////////////////////////////////////////////
//Components
import ScrollToTop from "./utils/ScrollToTop";
import ProtectedRoute from "./utils/ProtectedRoute";

import Navbar from "./components/Navbar/Navbar";

import Home from "./pages/Home";
import Feed from "./pages/Feed";

// import Dashboard from "./Pages/Dashboard/Dashboard";


import Login from "./pages/Login";
import Register from "./pages/Register";

import Profile from "./pages/Profile";

import Page404 from "./pages/Page404";
import Admin from "./pages/Admin";

//////////////////////////////////////////////////////////////////////////////////////////


export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-col flex-grow">
        <ScrollToTop />
        <main className="flex-grow">
          <Routes>


            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/feed" element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={<Admin />} />

            <Route path="*" element={<Page404 />} />

          </Routes>
        </main>
      </div>
    </div>
  );
}
