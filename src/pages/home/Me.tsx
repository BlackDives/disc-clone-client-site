import { useContext, useEffect, useState } from 'react'
import api from '@/api/AxiosInstance'
import z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Link, Outlet } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { AuthenticationContext } from '@/providers/auth/AuthProvider'
import axios from 'axios'

type FriendshipRequestDTO = {
    requestedName: string
    requesterName: string
    requesterId: string
}

type DirectMessageChannelDTO = {
    id: string
    userOneId: string
    userOneUsername: string
    userTwoId: string
    userTwoUsername: string
    createdAt: Date
    updatedAt: Date
}

const addFriendSchema = z.object({
    usernameToAdd: z
        .string('Username is required')
        .min(5, 'Not a valid username'),
})

const Me = () => {
    const { token, user } = useContext(AuthenticationContext)
    const [dms, setDms] = useState<Array<DirectMessageChannelDTO>>([])
    const addFriendForm = useForm<z.infer<typeof addFriendSchema>>({
        resolver: zodResolver(addFriendSchema),
        defaultValues: {
            usernameToAdd: '',
        },
    })

    useEffect(() => {
        getUserDirectMessageChannels()
    }, [])

    async function onSubmitFriendRequestForm(
        data: z.infer<typeof addFriendSchema>
    ) {
        if (user) {
            const newFriendRequest: FriendshipRequestDTO = {
                requestedName: data.usernameToAdd,
                requesterName: user?.username,
                requesterId: user?.id,
            }
            onSubmitFriendRequest(newFriendRequest)
        }
    }

    async function onSubmitFriendRequest(data: FriendshipRequestDTO) {
        try {
            const result = await api.post('v1/friendships', data, {
                headers: { Authorization: `Bearer ${token}` },
            })
            console.log(result)
            toast.success(`Request sent to ${data.requestedName}`)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    console.log('No response')
                    toast.error('Request failed.')
                } else {
                    const errorMessage = error.response.data
                    toast.error(errorMessage)
                    console.log(error)
                    console.log(typeof error)
                }
            } else {
                console.log(error)
                toast.error('Request failed.')
            }
        }
    }

    async function getUserDirectMessageChannels() {
        try {
            const results = await api.get(`v1/direct_messages/${user?.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const directMessages: Array<DirectMessageChannelDTO> =
                results.data.value
            console.log('DMs', results)
            setDms(directMessages)
        } catch (error) {
            console.log('error getting DM channels')
            console.log(error)
        }
    }
    return (
        <div className="w-full h-full flex flex-row border-1 border-zinc-600 rounded-xl bg-clip-padding rounded-b-none rounded-r-none border-b-0 border-r-0">
            <div className="w-[20%] bg-zinc-800 rounded-xl rounded-b-none">
                <div className="w-full mb-2 p-2 border-b border-zinc-600 h-[7%]">
                    <form
                        onSubmit={addFriendForm.handleSubmit(
                            onSubmitFriendRequestForm
                        )}
                    >
                        <FieldGroup>
                            <Controller
                                name="usernameToAdd"
                                control={addFriendForm.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel className="text-white">
                                            Add a friend
                                        </FieldLabel>
                                        <Input
                                            className="text-white"
                                            {...field}
                                            placeholder="Enter a username..."
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </form>
                </div>
                <div className="flex flex-col mb-4 p-2 border-b border-zinc-600">
                    <div className="w-full h-full">
                        <Link to="/channels/me/friends">
                            <Button className="flex flex-row justify-start w-full h-full bg-zinc-800">
                                Friends
                            </Button>
                        </Link>
                    </div>
                    <div className="w-full h-full">
                        <Link to="/channels/me/friend-requests">
                            <Button className="flex flex-row justify-start w-full h-full bg-zinc-800">
                                Friend Requests
                            </Button>
                        </Link>
                    </div>
                </div>
                <div>
                    <div className="flex flex-row justify-between items-center mb-2 px-2">
                        <p className="text-white font-semibold">
                            Direct Messages
                        </p>
                    </div>
                    <div className="flex flex-col px-2">
                        {dms.map((dm, index) => (
                            <Link key={index} to={`/channels/me/${dm.id}`}>
                                <div className="flex flex-row justify-start">
                                    <Button className="w-full h-full flex flex-row justify-start bg-transparent">
                                        <div>
                                            <p>
                                                {dm.userOneId === user?.id
                                                    ? dm.userTwoUsername
                                                    : dm.userOneUsername}
                                            </p>
                                        </div>
                                    </Button>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-[80%] bg-zinc-700">
                <Outlet />
            </div>
        </div>
    )
}

export default Me
