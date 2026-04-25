import { useEffect, useState } from "react";
import Landing from "./pages/Index.tsx";
import Engineer from "./Engineer.jsx";
import Doctor from "./Doctor.jsx";
import Designer from "./Designer.jsx";
import About from "./About.jsx";
import Confirmed from "./Confirmed.jsx";

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
  if (path === "/designer/report" || path === "/designer/report/") return <Designer reportMode={true} />;
  if (path === "/doctor/report" || path === "/doctor/report/") return <Doctor reportMode={true} />;
  if (path === "/engineer" || path === "/engineer/") return <Engineer />;
  if (path === "/engineer/report" || path === "/engineer/report/") return <Engineer reportMode={true} />;
  if (path === "/designer" || path === "/designer/") return <Designer />;
  if (path === "/about" || path === "/about/") return <About />;
  if (path === "/confirmed" || path === "/confirmed/") return <Confirmed />;
  return <Landing />;
}
