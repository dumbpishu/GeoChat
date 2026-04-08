import "dotenv/config";

type EnvConfig = {
    PORT: number;
    NODE_ENV: string;
    MONGO_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRY: string;
    EMAIL_FROM: string;
    RESEND_API_KEY: string;
    CROS_ORIGIN: string;
}

const genEnv = (key: string, required = true): string => {
    const value = process.env[key];

    if (required && !value) {
        console.error(`Environment variable ${key} is required but not defined.`);
        process.exit(1);
    }

    return value as string;
}

export const env: EnvConfig = {
    PORT: parseInt(genEnv("PORT")) || 3000,
    NODE_ENV: genEnv("NODE_ENV"),
    MONGO_URI: genEnv("MONGO_URI"),
    JWT_SECRET: genEnv("JWT_SECRET"),
    JWT_EXPIRY: genEnv("JWT_EXPIRY"),
    EMAIL_FROM: genEnv("EMAIL_FROM"),
    RESEND_API_KEY: genEnv("RESEND_API_KEY"),
    CROS_ORIGIN: genEnv("CROS_ORIGIN"),
}