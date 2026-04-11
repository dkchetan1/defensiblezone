import { useEffect, useState } from "react";
import Landing from "./Landing.jsx";
import Engineer from "./Engineer.jsx";
import Doctor from "./Doctor.jsx";
import Designer from "./Designer";
import About from "./About.jsx";

export default function App() {
  var [path, setPath] = useState(window.location.pathname);

  useEffect(function() {
    function onPop() { setPath(window.location.pathname); }
    window.addEventListener("popstate", onPop);
    return function() { window.removeEventListener("popstate", onPop); };
  }, []);

  if (path === "/doctor" || path === "/doctor/") return <Doctor />;
  if (path === "/engineer" || path === "/engineer/") return <Engineer />;
  if (path === "/designer" || path === "/designer/") return <Designer />;
  if (path === "/about" || path === "/about/") return <About />;
  return <Landing />;
}
