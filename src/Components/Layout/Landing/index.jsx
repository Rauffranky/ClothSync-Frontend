import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

const LandingLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
