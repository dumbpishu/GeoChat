import { Outlet } from "react-router-dom";

export const RootLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-blue-600 text-white p-4">
                <h1 className="text-2xl font-bold">GeoChat</h1>
            </header>
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="bg-gray-200 text-center p-4">
                <p className="text-sm text-gray-600">&copy; 2024 GeoChat. All rights reserved.</p>
            </footer>
        </div>
    );
}