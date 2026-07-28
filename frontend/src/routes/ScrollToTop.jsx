import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window ke paling atas 
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    // scroll elemen yang memiliki scrollbar
    const mainContainers = document.querySelectorAll("main");
    mainContainers.forEach((container) => {
      container.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    });
  }, [pathname]);

  return null;
}