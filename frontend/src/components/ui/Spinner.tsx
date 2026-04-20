export const Spinner = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) => {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-2",
        lg: "w-12 h-12 border-3",
    };

    return (
        <div className={`flex items-center justify-center min-h-screen bg-background ${className}`}>
            <div
                className={`${sizeClasses[size]} border-primary/30 border-t-primary rounded-full animate-spin`}
            />
        </div>
    );
};