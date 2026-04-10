export const SendOtp = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Send OTP</h1>
            <p className="text-lg text-gray-600 mb-8">Enter your phone number to receive an OTP for authentication.</p>
            <input
                type="text"
                placeholder="Enter your phone number"
                className="w-full max-w-sm p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button className="w-full max-w-sm px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Send OTP</button>
        </div>
    );
}