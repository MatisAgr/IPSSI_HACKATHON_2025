/////////////////////////////////////////////
//Dépendances
import { Routes, Route } from "react-router-dom";

/////////////////////////////////////////////
//Components
import ScrollToTop from "./utils/ScrollToTop";
import ProtectedRoute from "./utils/ProtectedRoute";

// import Dashboard from "./Pages/Dashboard/Dashboard";

// import Page404 from "./Pages/Page404/Page404";


import Login from "./pages/Login";
import Register from "./pages/Register";

//////////////////////////////////////////////////////////////////////////////////////////


export default function App() {
  return (
    <div className="flex min-h-screen">
      {/* <Navbar /> */}
      <div className="flex flex-col flex-grow">
        <ScrollToTop />
        <main className="flex-grow">
          <Routes>


            {/* <Route path="/" element={<Home />} /> */}

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* <Route path="/feed" element={<Feed />} */}

            {/* <Route path="/profile element={<Profile />} /> */}
            {/* <Route path="/profile/edit" element={<EditProfile />} /> */}

            {/* <Route path="*" element={<Page404 />} /> */}


          </Routes>
        </main>
      </div>
    </div>
  );
}
