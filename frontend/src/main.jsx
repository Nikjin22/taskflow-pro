import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { useThemeStore } from "./store/themeStore";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchInterval: 5000,
      retry: false,
    },
  },
});

useThemeStore.getState().init();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: "14px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);