import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import ChatOne from './pages/ChatOne.tsx'
import ChatTwo from './pages/ChatTwo.tsx'
import SignupPage from './pages/authentication/SignupPage.tsx'
import LoginPage from './pages/authentication/LoginPage.tsx'
import Me from './pages/home/Me.tsx'
import Friends from './pages/home/Friends.tsx'
import DirectMessage from './pages/home/DirectMessage.tsx'
import './index.css'
import App from './App.tsx'
import ServerLayout from './pages/server/ServerLayout.tsx'
import AuthProvider from './providers/auth/AuthProvider.tsx'
import { Toaster } from 'sonner'
import ServerChannel from './pages/server/ServerChannel.tsx'
import FriendRequests from './pages/home/FriendRequests.tsx'

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <AuthProvider>
                <App />
                <Toaster />
            </AuthProvider>
        ),
    },
    {
        path: '/channels',
        element: (
            <AuthProvider>
                <App />
                <Toaster />
            </AuthProvider>
        ),
        children: [
            {
                path: 'me',
                Component: Me,
                children: [
                    { path: 'friends', Component: Friends },
                    { path: ':directMessageId', Component: DirectMessage },
                    { path: 'friend-requests', Component: FriendRequests },
                ],
            },
            {
                path: ':serverId',
                Component: ServerLayout,
                children: [{ path: ':channelId', Component: ServerChannel }],
            },
        ],
    },
    {
        path: '/auth',
        children: [
            {
                path: 'login',
                element: (
                    <AuthProvider>
                        <Toaster />
                        <LoginPage />
                    </AuthProvider>
                ),
            },
            {
                path: 'signup',
                element: (
                    <AuthProvider>
                        <Toaster />
                        <SignupPage />
                    </AuthProvider>
                ),
            },
        ],
    },
])

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
)
