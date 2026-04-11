import { RouterProvider } from "react-router-dom"
import { appRouter } from "./routes/appRoutes"
import { useEffect } from "react"
import { useUserStore } from "./store/user.store"

function App() {
  const initAuth = useUserStore((state) => state.initAuth);
  
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
