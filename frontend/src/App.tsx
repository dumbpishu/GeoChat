import { RouterProvider } from "react-router-dom"
import { appRouter } from "./routes/appRoutes"
import { useEffect } from "react"
import { useAuthStore } from "./store/auth.store";

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  )
}

export default App
