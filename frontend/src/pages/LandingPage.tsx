import { Link } from "react-router-dom";
import { useUserStore } from "@/store/user.store";
import { MapPin, MessageCircle, Users, Shield, Zap, Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { ChatLogo } from "@/components/ChatLogo";

export const LandingPage = () => {
    const user = useUserStore((state) => state.user);

    return (
        <div className="min-h-screen bg-white">
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-slate-100 z-50">
                <div className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <ChatLogo size="md" />
                        <span className="text-2xl font-bold text-slate-800">GeoChat</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <UserMenu />
                        ) : (
                            <>
                                <Link to="/auth/send-otp">
                                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer hidden sm:flex">
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
                </div>
            </nav>

            <main className="pt-20">
                <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
                    
                    <div className="relative px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100/50 border border-sky-200/50 mb-6">
                                <Zap className="w-4 h-4 text-sky-500" />
                                <span className="text-sm text-slate-600 font-medium">Location-Powered Messaging</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 tracking-tight">
                                Chat with people
                                <span className="block bg-gradient-to-r from-sky-500 via-sky-400 to-purple-500 bg-clip-text text-transparent">
                                    around you
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-8 leading-relaxed">
                                Discover and connect with people in your neighborhood instantly. 
                                GeoChat brings real-time conversations to your local community with privacy-first messaging.
                            </p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <Link to={user ? "/chat" : "/auth/send-otp"}>
                                    <Button size="lg" className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 border-0 px-8 text-lg h-12 cursor-pointer">
                                        {user ? "Open Chat" : "Start Chatting Free"}
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Lock className="w-4 h-4 text-green-500" />
                                    <span>No credit card required</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 md:py-28 bg-slate-50">
                    <div className="px-6 md:px-12 max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                                Why choose GeoChat?
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Built for local communities with a focus on privacy, security, and seamless experience.
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                                <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-7 h-7 text-sky-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-3">Location-Based</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Connect with people in your area automatically. Discover conversations happening around you in real-time.
                                </p>
                            </div>
                            
                            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <MessageCircle className="w-7 h-7 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-3">Instant Messaging</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Lightning-fast messages with real-time delivery. Share text, images, and media instantly with anyone nearby.
                                </p>
                            </div>
                            
                            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Users className="w-7 h-7 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-3">Community</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Join local groups and build meaningful connections with people who share your interests.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 md:py-28">
                    <div className="px-6 md:px-12 max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                            <div className="order-2 md:order-1">
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                                    Your privacy is our <span className="text-sky-500">priority</span>
                                </h2>
                                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                    We believe your conversations should stay private. That's why GeoChat uses end-to-end encryption 
                                    and never shares your location data without consent.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800">End-to-End Encryption</h4>
                                            <p className="text-sm text-slate-600">Your messages stay private</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-sky-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800">Location Privacy</h4>
                                            <p className="text-sm text-slate-600">You control who sees your location</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800">Secure Authentication</h4>
                                            <p className="text-sm text-slate-600">OTP-based login verification</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 md:order-2 relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-sky-200 via-purple-200 to-sky-200 rounded-3xl blur-2xl opacity-50" />
                                <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                                        <ChatLogo size="md" />
                                        <span className="text-xl font-bold text-slate-800">GeoChat</span>
                                        <span className="ml-auto text-sm text-green-500 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            Online
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sm font-medium text-sky-600 flex-shrink-0">
                                                JD
                                            </div>
                                            <div className="bg-slate-100 rounded-2xl rounded-tl-md p-3 max-w-[80%]">
                                                <p className="text-sm text-slate-700">Hey! Are you going to the community event tonight?</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-600 flex-shrink-0">
                                                SK
                                            </div>
                                            <div className="bg-slate-100 rounded-2xl rounded-tl-md p-3 max-w-[80%]">
                                                <p className="text-sm text-slate-700">Yes! Can't wait. See you there 🎉</p>
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <div className="bg-sky-500 rounded-2xl rounded-br-md p-3 max-w-[80%]">
                                                <p className="text-sm text-white">Great! Meet at the usual spot 👋</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 md:py-28 bg-gradient-to-r from-sky-500 via-sky-400 to-purple-500">
                    <div className="px-6 md:px-12 max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to connect with your community?
                        </h2>
                        <p className="text-lg text-sky-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of people already using GeoChat to connect, chat, and build relationships in their local area.
                        </p>
                        <Link to={user ? "/chat" : "/auth/send-otp"}>
                            <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50 border-0 px-10 text-lg h-14 cursor-pointer shadow-xl">
                                {user ? "Go to Chat" : "Get Started Free"}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-900 py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <ChatLogo size="sm" />
                            <span className="text-xl font-bold text-white">GeoChat</span>
                        </div>
                        <div className="flex items-center gap-6 text-slate-400 text-sm">
                            <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
                            <Link to="#" className="hover:text-white transition-colors">Terms</Link>
                            <Link to="#" className="hover:text-white transition-colors">Contact</Link>
                        </div>
                        <p className="text-slate-500 text-sm">© 2026 GeoChat. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};