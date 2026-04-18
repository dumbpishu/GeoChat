import { Link } from "react-router-dom";
import { useUserStore } from "@/store/user.store";
import { MapPin, MessageCircle, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { ChatLogo } from "@/components/ChatLogo";

export const LandingPage = () => {
    const user = useUserStore((state) => state.user);

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50">
            <nav className="flex items-center justify-between px-6 md:px-8 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <ChatLogo size="md" />
                </div>
                <div className="flex items-center gap-3">
                    {user ? (
                        <UserMenu />
                    ) : (
                        <>
                            <Link to="/auth/send-otp">
                                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer">
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/auth/send-otp">
                                <Button className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 border-0 cursor-pointer">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            <main>
                <section className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto">
                    <div className="absolute top-20 right-10 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-10 w-64 h-64 bg-sky-200/30 rounded-full blur-3xl" />
                    
                    <div className="relative text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100/50 border border-sky-200/50 mb-6 md:mb-8">
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                            <span className="text-sm text-slate-600">Real-time location-based messaging</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-4 md:mb-6 tracking-tight">
                            Connect Through
                            <span className="block bg-gradient-to-r from-sky-500 via-sky-400 to-sky-600 bg-clip-text text-transparent">
                                Location
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                            Discover and chat with people around you. GeoChat brings conversations to your neighborhood, making connections meaningful and local.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Link to={user ? "/chat" : "/auth/send-otp"}>
                                <Button size="lg" className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 border-0 px-6 md:px-8 text-base md:text-lg cursor-pointer">
                                    {user ? "Open Chat" : "Start Chatting"}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        <div className="p-6 md:p-8 rounded-2xl bg-white/60 border border-sky-100/50 backdrop-blur-sm hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-400/20 flex items-center justify-center mb-4">
                                <MapPin className="w-6 h-6 text-sky-500" />
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-3">Location-Based</h3>
                            <p className="text-slate-600">
                                Connect with people in your area. Find conversations happening around you in real-time.
                            </p>
                        </div>
                        <div className="p-6 md:p-8 rounded-2xl bg-white/60 border border-sky-100/50 backdrop-blur-sm hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                                <MessageCircle className="w-6 h-6 text-purple-500" />
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-3">Instant Messaging</h3>
                            <p className="text-slate-600">
                                Fast and secure messaging with end-to-end encryption. Your conversations stay private.
                            </p>
                        </div>
                        <div className="p-6 md:p-8 rounded-2xl bg-white/60 border border-sky-100/50 backdrop-blur-sm hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-green-500" />
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-3">Community</h3>
                            <p className="text-slate-600">
                                Join local groups and discover communities that share your interests and location.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="px-6 py-16 md:py-20 max-w-7xl mx-auto text-center">
                    <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-100">
                        <Shield className="w-10 h-10 text-sky-500 mx-auto mb-4" />
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Your Privacy Matters</h2>
                        <p className="text-slate-600 max-w-xl mx-auto mb-6">
                            We prioritize your security with advanced encryption. Your location data is handled responsibly and never shared without consent.
                        </p>
                        <Link to={user ? "/chat" : "/auth/send-otp"}>
                            <Button size="lg" className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 border-0 px-6 md:px-8 cursor-pointer">
                                {user ? "Go to Chat" : "Try It Now — It's Free"}
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-sky-100 py-6">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">© 2026 GeoChat. All rights reserved.</p>
                    <p className="text-slate-500 text-sm">Made with ♥ for local communities</p>
                </div>
            </footer>
        </div>
    );
};