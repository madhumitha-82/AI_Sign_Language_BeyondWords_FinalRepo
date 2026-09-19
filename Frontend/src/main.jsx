import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";
import { SidebarProvider } from "./context/SidebarContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";

// TODO: Replace this with your actual Google Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = "1059467174950-5cb0gpo6uuu5nkgr524k306dq0eiscu6.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AppContextProvider>
          <SidebarProvider>
            <App />
          </SidebarProvider>
        </AppContextProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
