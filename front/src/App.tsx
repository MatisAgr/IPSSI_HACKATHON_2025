/////////////////////////////////////////////
//Dépendances
import { Routes, Route } from "react-router-dom";

/////////////////////////////////////////////
//Components
import ScrollToTop from "./utils/ScrollToTop";


// import Dashboard from "./Pages/Dashboard/Dashboard";

// import Page404 from "./Pages/Page404/Page404";

//////////////////////////////////////////////////////////////////////////////////////////


export default function App() {
  return (
    <div className="flex min-h-screen">
      {/* <Navbar /> */}
      <div className="flex flex-col flex-grow">
        <ScrollToTop />
        <main className="flex-grow">
          <Routes>


            {/* <Route path="/" element={<Home />} />

            <Route path="*" element={<Page404 />} /> */}


          </Routes>
        </main>
      </div>
    </div>
  );
}
