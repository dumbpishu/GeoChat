import { createBrowserRouter } from 'react-router-dom';

import { PublicRoutes } from '@/components/gaurds/PublicRoutes';
import { ProtectedRoutes } from '@/components/gaurds/ProtectedRoutes';

import { RootLayout } from '@/components/layouts/RootLayout';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { ChatLayout } from '@/components/layouts/ChatLayout';

import { LandingPage } from '@/pages/LandingPage';
import { SendOtp } from '@/pages/auth/SendOtp';
import { VerifyOtp } from '@/pages/auth/VerifyOtp';
import { Chat } from '@/pages/Chat';

export const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <LandingPage />
            },
            {
                element: <PublicRoutes />,
                children: [
                    {
                        path: "auth",
                        element: <AuthLayout />,
                        children: [
                            {
                                path: "send-otp",
                                element: <SendOtp />
                            },
                            {
                                path: "verify-otp",
                                element: <VerifyOtp />
                            }
                        ]
                    }
                ]
            },
            {
                element: <ProtectedRoutes />,
                children: [
                    {
                        path: "chat",
                        element: <ChatLayout />,
                        children: [
                            {
                                index: true,
                                element: <Chat />
                            }
                        ]
                    }
                ]
            }
        ]
    }
]);