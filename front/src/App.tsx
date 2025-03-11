/////////////////////////////////////////////
//Dépendances
import { Routes, Route } from "react-router-dom";

/////////////////////////////////////////////
//Components
import ScrollToTop from "./utils/ScrollToTop";
import ProtectedRoute from "./utils/ProtectedRoute";

import Navbar from "./components/Navbar/Navbar";

import Home from "./pages/Home";

// import Dashboard from "./Pages/Dashboard/Dashboard";


import Login from "./pages/Login";
import Register from "./pages/Register";

import Profile from "./pages/Profile";

import Page404 from "./pages/Page404";

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


            {/* <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } /> */}
            <Route path="/profile" element={<Profile />} />



            {/* <Route path="/feed" element={<Feed />} */}

            {/* <Route path="/profile element={<Profile />} /> */}
            {/* <Route path="/profile/edit" element={<EditProfile />} /> */}

            <Route path="*" element={<Page404 />} />


          </Routes>
        </main>
      </div>
    </div>
  );
}
