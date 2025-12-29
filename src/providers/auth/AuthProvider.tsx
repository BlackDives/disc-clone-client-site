import { createContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import type { UserProfile } from '@/models/user/User'
import api from '@/api/AxiosInstance'
// import { RegisterModel } from '@/models/auth/AuthModel'
import { toast } from 'sonner'

type UserContextType = {
    user: UserProfile | null
    token: string | null
    register: (
        username: string,
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ) => void
    login: (email: string, password: string) => void
    logout: () => void
    isLoggedIn: () => boolean
    checkStateValues: () => void
}

type AuthProviderProps = {
    children: ReactNode
}

export const AuthenticationContext = createContext<UserContextType>(
    {} as UserContextType
)

const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isReady, setIsReady] = useState<boolean>(false)
    const [isConfigured, setIsConfigured] = useState<boolean>(false)

    const BASE_URL = import.meta.env.VITE_API_URL
    const REAL_TIME_URL = import.meta.env.VITE_REALTIME_URL

    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token) {
            console.log(`token: ${token}`)
            navigate('/auth/login')
        } else {
            console.log('this is running in the provider at line 51')
            const { UserId, email, sub } = parseJWT(token)
            const user: UserProfile = {
                id: UserId,
                username: sub,
                email: email,
                tokenExpiration: sub,
            }

            setToken(token)
            setUser(user)
        }

        setIsReady(true)
    }, [])

    async function register(
        username: string,
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ) {
        try {
            const data = { username, firstName, lastName, email, password }
            const results = await api.post('/v1/auth/register', data)
            const newToken = results.data
            const claims = parseJWT(newToken)
            // const { UserId, email, sub } = parseJWT(newToken)
            const user: UserProfile = {
                id: claims.UserId,
                username: claims.sub,
                email: claims.email,
                tokenExpiration: claims.sub,
            }

            setToken(newToken)
            setUser(user)
            localStorage.setItem('token', newToken)
            navigate('/channels/me')
        } catch (error) {
            console.log(error)
            toast.error(error.response.data)
        }
    }

    async function login(email: string, password: string) {
        const data = { email, password }
        try {
            const results = await api.post('/v1/auth/login', data)
            console.log(results)
            const newToken = results.data
            const { UserId, email, sub } = parseJWT(newToken)
            const user: UserProfile = {
                id: UserId,
                username: sub,
                email: email,
                tokenExpiration: sub,
            }

            setToken(newToken)
            setUser(user)
            localStorage.setItem('token', newToken)
            navigate('/channels/me')
        } catch (error) {
            console.log(error)
            toast.error(error.response.data)
        }
    }

    function logout() {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        navigate('/auth/login')
    }

    function isLoggedIn(): boolean {
        return user ? true : false
    }
    return (
        <AuthenticationContext.Provider
            value={{
                user,
                token,
                register,
                login,
                logout,
                isLoggedIn,
                checkStateValues,
            }}
        >
            {isReady ? children : null}
        </AuthenticationContext.Provider>
    )

    function checkStateValues() {
        console.log(`from provide:\ntoken: ${token}\nuser: ${user}`)
    }
}

const parseJWT = (token: string) => {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace('/-/g', '+').replace('/_/g', '/')
    const jsonPayload = decodeURIComponent(
        window
            .atob(base64)
            .split('')
            .map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            })
            .join('')
    )

    return JSON.parse(jsonPayload)
}

export default AuthProvider
