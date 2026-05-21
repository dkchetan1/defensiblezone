import { useEffect, useState } from "react";
import Landing from "./pages/Index.tsx";
import Engineer from "./Engineer.jsx";
import Doctor from "./Doctor.jsx";
import Finance from "./Finance.jsx";
import ProductManager from "./ProductManager.jsx";
import About from "./About.jsx";
import Confirmed from "./Confirmed.jsx";
import UX from "./UX.jsx";

export default function App() {
  var [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    if (window.gtag) {
      window.gtag("config", "G-6F5WG5HRTE", {
        page_path: window.location.pathname,
      });
    }
  }, []);

  useEffect(function() {
    function onPop() { setPath(window.location.pathname); }
    window.addEventListener("popstate", onPop);
    return function() { window.removeEventListener("popstate", onPop); };
  }, []);

  if (path === "/doctor" || path === "/doctor/") return <Doctor />;
  if (path === "/doctor/report" || path === "/doctor/report/") return <Doctor reportMode={true} />;
  if (path === "/engineer" || path === "/engineer/") return <Engineer />;
  if (path === "/engineer/report" || path === "/engineer/report/") return <Engineer reportMode={true} />;
  if (path === "/about" || path === "/about/") return <About />;
  if (path === "/confirmed" || path === "/confirmed/") return <Confirmed />;
  if (path === "/finance" || path === "/finance/") return <Finance />;
  if (path === "/finance/report" || path === "/finance/report/") return <Finance reportMode={true} />;
  if (path === "/pm" || path === "/pm/") return <ProductManager />;
  if (path === "/ux" || path === "/ux/") return <UX />;
  return <Landing />;
}
