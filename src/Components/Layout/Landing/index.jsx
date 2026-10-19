import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

const LandingLayout = () => {
  const isHome = useLocation().pathname === "/";
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={isHome ? "w-full flex-1" : "mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-0"}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
