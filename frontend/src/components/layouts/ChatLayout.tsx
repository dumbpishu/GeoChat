import { 
    MapPin, Menu, Bell, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Outlet } from "react-router-dom";

export const ChatLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-950">
            <header className="h-16 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-sky-500 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white hidden md:block">GeoChat</span>
                </div>
                
                <div className="flex items-center gap-1 md:gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white cursor-pointer">
                        <Search className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white cursor-pointer">
                        <Bell className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white lg:hidden cursor-pointer">
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>
            </header>
            
            <main className="flex-1 flex overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
};