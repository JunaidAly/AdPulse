import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "@/app/store";
import { router } from "@/app/router";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <TooltipProvider delayDuration={200}>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </Provider>
  </React.StrictMode>,
);
