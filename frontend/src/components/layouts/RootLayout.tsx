import { Outlet } from "react-router-dom";

export const RootLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-white to-sky-50">
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};