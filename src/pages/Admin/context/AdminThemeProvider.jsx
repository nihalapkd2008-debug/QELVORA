import { useEffect, useState } from "react";
import { AdminThemeContext } from "./AdminThemeContext";

function AdminThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("qelvora-admin-theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem(
      "qelvora-admin-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  return (
    <AdminThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export default AdminThemeProvider;