
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import { store } from "./redux/store";
import AdminThemeProvider from "./pages/Admin/context/AdminThemeProvider";
import "./index.css";
import "./App.css";
import App from "./App.jsx";
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
  <BrowserRouter>
    <AdminThemeProvider>
      <App />
    </AdminThemeProvider>
  </BrowserRouter>
</Provider>
);
