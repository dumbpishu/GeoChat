import { Link } from "react-router-dom";

export const LandingPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Welcome to GeoChat</h1>
            <p className="text-lg text-gray-600 mb-8">Connect with people around you in real-time!</p>
            <Link to="/auth/send-otp" className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Get Started</Link>
        </div>
    );
}