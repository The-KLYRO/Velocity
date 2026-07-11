import { useEffect } from "react";
import { AppRoutes } from "./routes";

function App() {
  useEffect(() => {
    const handler = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, []);

  return <AppRoutes />;
}

export default App;
