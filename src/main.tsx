import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "@/app/store";
import { router } from "@/app/router";
import { useAppDispatch } from "@/app/hooks";
import { subscribeToSession } from "@/services";
import { sessionResolved } from "@/features/auth/authSlice";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./index.css";


function AppRoot() {
  const dispatch = useAppDispatch();
  useEffect(
    () => subscribeToSession((user) => dispatch(sessionResolved(user))),
    [dispatch],
  );
  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <TooltipProvider delayDuration={200}>
        <AppRoot />
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </Provider>
  </React.StrictMode>,
);
