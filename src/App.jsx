import { useEffect, useState } from "react";
import Landing from "./Landing.jsx";
import Engineer from "./Engineer.jsx";
import Doctor from "./Doctor.jsx";

export default function App() {
  var [path, setPath] = useState(window.location.pathname);

  useEffect(function() {
    function onPop() { setPath(window.location.pathname); }
    window.addEventListener("popstate", onPop);
    return function() { window.removeEventListener("popstate", onPop); };
  }, []);

  if (path === "/doctor" || path === "/doctor/") return <Doctor />;
  if (path === "/engineer" || path === "/engineer/") return <Engineer />;
  return <Landing />;
}
