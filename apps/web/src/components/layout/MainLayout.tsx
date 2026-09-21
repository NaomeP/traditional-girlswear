import { Outlet } from "react-router";
import Header from "./Header";
import Footer from "./Footer";

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf1] text-[#24160f]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-[#24160f] focus:px-4 focus:py-2 focus:text-sm focus:text-[#fffaf1]"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
