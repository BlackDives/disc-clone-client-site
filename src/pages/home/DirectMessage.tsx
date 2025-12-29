import { useState, useEffect, useContext } from 'react'
import * as signalR from '@microsoft/signalr'
import z from 'zod'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AuthenticationContext } from '@/providers/auth/AuthProvider'
import { useParams } from 'react-router'
import api from '@/api/AxiosInstance'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Field, FieldGroup } from '@/components/ui/field'
import { EllipsisVertical } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type OtherUser = {
    otherUserId: string
    otherUserUsername: string
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
type DirectMessageDTO = {
    messageId: string
    directMessageChannelId: string
    senderId: string
    senderUsername: string
    messageContent: string
    createdAt: Date
    updatedAt: Date
}

type DirectMessage = {
    id: string
    senderId: string
    senderUsername: string
    messageContent: string
    created: string
    messageDate: string
    messageTime: string
    originalCreatedAt: Date
    originalUpdatedAt: Date
}

const messageSchema = z.object({
    message: z.string().min(1),
})

const DirectMessage = () => {
    const { token, user } = useContext(AuthenticationContext)
    const [messages, setMessages] = useState<Array<DirectMessage>>([])
    const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
    const [connection, setConnection] = useState<signalR.HubConnection | null>(
        null
    )
    const params = useParams()
    const sendMessageForm = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema),
        defaultValues: { message: '' },
    })
    const REAL_TIME_URL = import.meta.env.VITE_REALTIME_URL

    useEffect(() => {
        getOtherDirectMessageUser()
        getDirectMessages()
    }, [params.directMessageId])

    useEffect(() => {
        if (connection === null) {
            return
        } else {
            console.log('trying to join DM')
            connection.start().then(() => {
                connection
                    .invoke('JoinRoom', params.directMessageId)
                    .then(() => {
                        console.log('joining dm room')
                    })
                    .catch((e) => {
                        console.log('error')
                        console.log(e)
                    })

                connection.on('ReceiveGroupMessage', receiveGroupMessage)
                connection.on(
                    'ReceiveGroupMessageDeleted',
                    receiveGroupMessageDeleted
                )
            })
        }

        return () => {
            if (connection !== null) {
                connection.stop()
            }
        }
    }, [connection, params.directMessageId])

    useEffect(() => {
        const connectionBuild = new signalR.HubConnectionBuilder()
            .withUrl(`${REAL_TIME_URL}/chatHub`)
            .withAutomaticReconnect()
            .build()

        setConnection(connectionBuild)
    }, [params.directMessageId])

    function onMessageSend(data: z.infer<typeof messageSchema>) {
        if (!user) {
            return
        }
        connection
            ?.invoke(
                'SendGroupMessage',
                user.username,
                user.id,
                data.message,
                params.directMessageId
            )
            .then(() => {
                console.log('message sent')
            })
            .catch((err) => {
                console.error(err)
            })

        console.log(sendMessageForm)
        sendMessageForm.reset()
    }

    async function receiveGroupMessage(
        senderUsername: string,
        senderId: string,
        message: string,
        roomName: string
    ) {
        var today = new Date()
        var dd = String(today.getDate()).padStart(2, '0')
        var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
        var yyyy = today.getFullYear()

        const todayDate = mm + '/' + dd + '/' + yyyy
        const time = today.getHours() + ':' + today.getMinutes()

        roomName

        const newMessage: DirectMessage = {
            id: '1',
            senderId: senderId,
            senderUsername: senderUsername,
            messageContent: message,
            created: '',
            messageDate: todayDate,
            messageTime: time,
            originalCreatedAt: new Date(),
            originalUpdatedAt: new Date(),
        }

        if (senderId === user?.id) {
            onDirectMessageSend(newMessage)
        }
        if (senderId !== user?.id) {
            setMessages((oldMessages) => {
                return [...oldMessages, newMessage]
            })
        }
    }

    async function receiveGroupMessageDeleted(
        senderUsername: string,
        senderId: string,
        messageId: string,
        roomName: string
    ) {
        if (senderId === user?.id) {
            return
        } else {
            console.log('message deleted')

            const newArry: Array<DirectMessage> = messages.filter((message) => {
                console.log('entering array')
                if (message.id !== messageId) {
                    console.log(
                        `${message.id} !== ${messageId} so adding it to array`
                    )
                    return message
                } else {
                    console.log(
                        `${message.id} === ${messageId} so removing it from array`
                    )
                }
            })
            console.log('new arry', newArry)
            setMessages(newArry)
            roomName + ''
            senderUsername + ''
        }
    }

    async function getOtherDirectMessageUser() {
        try {
            const results = await api.get(
                `v1/direct_messages/channels/${params.directMessageId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const dmcDTO: DirectMessageChannelDTO = results.data
            if (dmcDTO.userOneId === user?.id) {
                const otherUserBuffer: OtherUser = {
                    otherUserId: dmcDTO.userTwoId,
                    otherUserUsername: dmcDTO.userTwoUsername,
                }
                setOtherUser(otherUserBuffer)
            } else {
                const otherUserBuffer: OtherUser = {
                    otherUserId: dmcDTO.userOneId,
                    otherUserUsername: dmcDTO.userOneUsername,
                }
                setOtherUser(otherUserBuffer)
            }
            console.log(results)
        } catch (error) {
            console.log(error)
        }
    }

    async function getDirectMessages() {
        try {
            const results = await api.get(
                `v1/direct_messages/${params.directMessageId}/messages`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const messages: Array<DirectMessageDTO> = results.data
            const mappedMessages: Array<DirectMessage> = messages.map(
                (message) => {
                    var today = new Date(message.createdAt)
                    var dd = String(today.getDate()).padStart(2, '0')
                    var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
                    var yyyy = today.getFullYear()

                    const todayDate = mm + '/' + dd + '/' + yyyy
                    const time = today.getHours() + ':' + today.getMinutes()
                    const newMessage: DirectMessage = {
                        id: message.messageId,
                        senderId: message.senderId,
                        senderUsername: message.senderUsername,
                        messageContent: message.messageContent,
                        created: '',
                        messageDate: todayDate,
                        messageTime: time,
                        originalCreatedAt: message.createdAt,
                        originalUpdatedAt: message.updatedAt,
                    }

                    return newMessage
                }
            )
            console.log(results)
            setMessages(mappedMessages)
        } catch (error) {
            console.log(error)
        }
    }

    async function onMessageDelete(messageId: string) {
        try {
            const results = await api.delete(
                `v1/direct_messages/${params.directMessageId}/messages/${messageId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            await connection?.invoke(
                'SendGroupMessageDeleted',
                user?.username,
                user?.id,
                messageId,
                params.directMessageId
            )
            console.log(results)
            console.log(results.data)
            const newArry: Array<DirectMessage> = messages.filter((message) => {
                if (message.id !== results.data.messageId) {
                    return message
                }
            })
            setMessages(newArry)
        } catch (error) {
            console.log(error)
        }
    }

    async function onDirectMessageSend(message: DirectMessage) {
        if (user && params.directMessageId) {
            const data: DirectMessageDTO = {
                messageId: '',
                directMessageChannelId: params.directMessageId,
                senderId: message.senderId,
                senderUsername: message.senderUsername,
                messageContent: message.messageContent,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            try {
                const results = await api.post(
                    `v1/direct_messages/${params.directMessageId}/messages`,
                    data,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                console.log('dm that was sentttt', results)
                var today = new Date(results.data.createdAt)
                var dd = String(today.getDate()).padStart(2, '0')
                var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
                var yyyy = today.getFullYear()

                const todayDate = mm + '/' + dd + '/' + yyyy
                const time = today.getHours() + ':' + today.getMinutes()
                const newData: DirectMessage = {
                    id: results.data.messageId,
                    senderId: data.senderId,
                    senderUsername: data.senderUsername,
                    messageContent: results.data.messageContent,
                    created: '',
                    messageDate: todayDate,
                    messageTime: time,
                    originalCreatedAt: results.data.createdAt,
                    originalUpdatedAt: results.data.updatedAt,
                }

                setMessages((oldMessages) => {
                    return [...oldMessages, newData]
                })
            } catch (error) {
                console.log(error)
            }
        }
    }
    return (
        <div className="h-full w-full">
            <div className="h-[7%] border-b border-zinc-600 flex flex-row items-center px-4">
                <div className="flex flex-row items-center">
                    <div className="mr-2">
                        <Avatar>
                            <AvatarImage
                                sizes="sm"
                                src="https://github.com/shadcn.png"
                            />
                        </Avatar>
                    </div>
                    <p className="text-white">{otherUser?.otherUserUsername}</p>
                </div>
                <div></div>
            </div>
            <div className="flex flex-row h-[93%]">
                <div className="flex flex-col justify-end h-full w-[70%] px-4 pb-2">
                    <div className="mb-4 overflow-y-auto">
                        {messages.map((message, index) => {
                            return (
                                <div
                                    key={index}
                                    className="flex flex-row justify-between items-center p-2 py-1 hover:bg-zinc-800 rounded-lg"
                                >
                                    <div className="flex flex-row">
                                        <div className="flex flex-col justify-start mr-4">
                                            <Avatar>
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                            </Avatar>
                                        </div>
                                        <div className="flex flex-col justify-start">
                                            <div className="flex flex-row">
                                                <div className="mr-2">
                                                    <p className="text-white font-bold">
                                                        {message.senderUsername}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-zinc-600">
                                                        {message.messageDate}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-white">
                                                    {message.messageContent}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {message.senderId === user?.id && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button className="">
                                                    <EllipsisVertical />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuLabel>
                                                    Message
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        onMessageDelete(
                                                            message.id
                                                        )
                                                    }}
                                                >
                                                    Delete Message
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div>
                        <form
                            onSubmit={sendMessageForm.handleSubmit(
                                onMessageSend
                            )}
                        >
                            <FieldGroup>
                                <Controller
                                    name="message"
                                    control={sendMessageForm.control}
                                    render={({ field, fieldState }) => (
                                        <div className="flex flex-row border border-zinc-600 rounded-lg h-15 p-2">
                                            <Field className="h-full">
                                                <Input
                                                    {...field}
                                                    aria-invalid={
                                                        fieldState.invalid
                                                    }
                                                    placeholder={`Message @${otherUser?.otherUserUsername}`}
                                                    className="border-0 h-full w-[95%] focus-visible:ring-0 text-white"
                                                />
                                            </Field>
                                        </div>
                                    )}
                                />
                            </FieldGroup>
                        </form>
                    </div>
                </div>
                <div className="flex flex-col bg-zinc-600 w-[30%]">
                    <div className="h-30 bg-yellow-900 mb-2"></div>
                    <div className="flex flex-col px-4">
                        <div className="mb-2">
                            <Avatar className="h-15 w-15">
                                <AvatarImage
                                    sizes="lg"
                                    src="https://github.com/shadcn.png"
                                />
                            </Avatar>
                        </div>
                        <div className="mb-2">
                            <div>
                                <p className="font-bold text-white text-lg">
                                    {otherUser?.otherUserUsername}
                                </p>
                            </div>
                            <div>
                                <p className="text-white text-sm">
                                    {otherUser?.otherUserUsername}
                                </p>
                            </div>
                        </div>
                        <div className="bg-zinc-700 p-2 rounded-lg">
                            <div>
                                <p className="text-white text-sm font-bold">
                                    Member Since
                                </p>
                            </div>
                            <div>
                                <p className="text-white text-md">
                                    The early days
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DirectMessage
