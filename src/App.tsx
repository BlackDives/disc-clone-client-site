import { useState, useEffect, useContext } from 'react'
import api from './api/AxiosInstance'
import { Outlet, Link } from 'react-router'
import { House } from 'lucide-react'
import { Button } from './components/ui/button'
import { AuthenticationContext } from './providers/auth/AuthProvider'
import CreateServer from './components/server_creation/CreateServer'
import { Tooltip, TooltipTrigger } from './components/ui/tooltip'
import { TooltipContent } from '@radix-ui/react-tooltip'

type ServerPreview = {
    id: string
    name: string
}

function App() {
    const { user, token, logout } = useContext(AuthenticationContext)
    const [servers, setServers] = useState<ServerPreview[]>([])

    useEffect(() => {
        getAllUserServers()
    }, [])

    const getAllUserServers = async () => {
        if (!user) {
            return
        }
        try {
            console.log('running this shit')
            const results = await api.get(`/v1/users/${user.id}/servers`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            setServers(results.data)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="flex h-dvh w-screen flex-col box-border">
            <div className="bg-zinc-800 flex flex-col items-center h-[3%]">
                <p className="text-white">Chat</p>
            </div>
            <div className="flex flex-row h-[97%]">
                <div className="flex flex-col bg-zinc-800 w-[5%] h-[100%]">
                    <div className="flex flex-col items-center h-full w-full">
                        <div className="flex w-full items-center justify-center h-[5%]">
                            <Link to="/channels/me">
                                <House color="white" size={35} />
                            </Link>
                        </div>
                        <div className="flex flex-col items-center justify-between w-full h-[95%]">
                            <div className="flex flex-col items-center w-full">
                                <div className="flex flex-col mb-4 items-center w-full py-2 px-2">
                                    {servers.map((data, index) => {
                                        return (
                                            <Link
                                                className="flex flex-row justify-center items-center w-full h-[50px]  bg-zinc-600 mb-4 rounded-2xl"
                                                key={index}
                                                to={`${data.id}`}
                                            >
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex flex-row justify-center w-full">
                                                            <span className="text-white text-lg">
                                                                {data.name
                                                                    .charAt(0)
                                                                    .toLocaleUpperCase()}
                                                            </span>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent
                                                        className="bg-zinc-700 p-2 rounded-lg"
                                                        side="right"
                                                        sideOffset={5}
                                                    >
                                                        <p className="text-white">
                                                            {data.name}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </Link>
                                        )
                                    })}
                                </div>
                                <CreateServer />
                            </div>
                            <div className="mb-4">
                                <Button className="bg-red-600" onClick={logout}>
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-[95%] bg-clip-padding bg-zinc-800">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default App
