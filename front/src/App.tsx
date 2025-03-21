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
import FeedTag from "./pages/FeedTag";

// import Dashboard from "./Pages/Dashboard/Dashboard";


import Login from "./pages/Login";
import Register from "./pages/Register";

import Profile from "./pages/Profile";
import ProfileUser from "./pages/ProfileUser";

import Page404 from "./pages/Page404";
import Notification from "./components/Notification";
import useSocketAuth from './hooks/useSocketAuth';

import Admin from "./pages/Admin";
import Admin2 from "./pages/Admin2";

//////////////////////////////////////////////////////////////////////////////////////////


export default function App() {
  useSocketAuth();
  return (
    <div className="min-h-screen">
      <Navbar />
      <Notification />

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

            <Route path="/user/:hashtag" element={
              <ProtectedRoute>
                <ProfileUser />
              </ProtectedRoute>
            } />

            <Route path="/feed" element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            } />

            <Route path="/feed/search" element={
              <ProtectedRoute>
                <FeedTag />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={<Admin />} />
            <Route path="/admin2" element={<Admin2 />} />

            <Route path="*" element={<Page404 />} />

          </Routes>
        </main>
      </div>
    </div>
  );
}
