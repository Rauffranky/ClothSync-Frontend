import { useEffect } from "react";
import AppRoutes from "./Routes";
import { applyThemeMode, getThemeMode } from "./Utils/themeMode";

function App() {
  useEffect(() => {
    applyThemeMode(getThemeMode());
  }, []);

  return <AppRoutes />;
}

export default App;
