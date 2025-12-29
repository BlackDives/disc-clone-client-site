import { useContext, useEffect, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import * as z from 'zod'
import api from '@/api/AxiosInstance'
import { useForm, Controller } from 'react-hook-form'
import { EllipsisVertical, Hash } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { AuthenticationContext } from '@/providers/auth/AuthProvider'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FieldGroup } from '@/components/ui/field'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useParams } from 'react-router'

const messageSchema = z.object({
    message: z.string().min(1),
})

type Message = {
    id: string
    senderId: string
    senderUsername: string
    messageContent: string
    created: string
    messageDate: string
    messageTime: string
}

type MessageDTO = {
    id: string
    senderId: string
    senderUsername: string
    channelId: string
    text: string
    created: Date
}

type NewMessageDTO = {
    senderId: string
    channelId: string
    text: string
}

type ServerMember = {
    id: string
    username: string
}

type ChannelInfo = {
    id: string
    name: string
    type: string
}

const ServerChannel = () => {
    const params = useParams()
    const { user, token } = useContext(AuthenticationContext)
    const [messages, setMessages] = useState<Array<Message>>([])
    const [members, setMembers] = useState<Array<ServerMember>>([])
    const [channelName, setChannelName] = useState<string>('')

    const [connection, setConnection] = useState<signalR.HubConnection | null>(
        null
    )

    useEffect(() => {
        if (connection === null) {
            return
        } else {
            console.log(window.location.pathname.split('/')[3])
            connection.start().then(() => {
                connection
                    .invoke('JoinRoom', window.location.pathname.split('/')[3])
                    .then(() => {
                        console.log('joining main room')
                    })
                    .catch((e) => {
                        console.log('error')
                        console.log(e)
                    })

                connection.on('ReceiveGroupMessage', receiveGroupMessage)
            })
        }

        return () => {
            if (connection !== null) {
                connection.stop()
            }
        }
    }, [connection, params.channelId])

    useEffect(() => {
        const connectionBuild = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:7008/chatHub')
            .withAutomaticReconnect()
            .build()

        setConnection(connectionBuild)
    }, [params.channelId])

    useEffect(() => {
        getServerMembers()
        setMessages([])
        if (params.channelId) {
            getChannelName(params.channelId)
            getChannelMessages(params.channelId)
        }
    }, [params.channelId])

    const sendMessageForm = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema),
        defaultValues: { message: '' },
    })

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
                window.location.pathname.split('/')[3]
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
        roomName += 'yo'

        const newMessage: Message = {
            id: '1',
            senderId: senderId,
            senderUsername: senderUsername,
            messageContent: message,
            created: '',
            messageDate: todayDate,
            messageTime: time,
        }

        setMessages((oldMessages) => {
            return [...oldMessages, newMessage]
        })
        if (params.channelId && user && user.id === senderId) {
            console.log('woah jimmy')
            onServerSendMessage(params.channelId, {
                senderId: user.id,
                channelId: params.channelId,
                text: newMessage.messageContent,
            })
        }
    }

    async function onServerSendMessage(
        channelId: string,
        newMessage: NewMessageDTO
    ) {
        try {
            const result = await api.post(
                `/v1/channels/${channelId}/messages`,
                newMessage,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            console.log(result)
        } catch (error) {
            console.log(error)
        }
    }

    async function getChannelMessages(channelId: string) {
        try {
            const results = await api.get(
                `/v1/channels/${channelId}/messages`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            console.log(results)
            console.log('messages: ', results.data)
            const newMessages: Array<Message> = results.data.map(
                (data: MessageDTO) => {
                    var today = new Date(data.created)
                    var dd = String(today.getDate()).padStart(2, '0')
                    var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
                    var yyyy = today.getFullYear()

                    const todayDate = mm + '/' + dd + '/' + yyyy
                    const time = today.getHours() + ':' + today.getMinutes()

                    return {
                        ...data,
                        senderUsername: data.senderUsername,
                        messageContent: data.text,
                        messageDate: todayDate,
                        messageTime: time,
                    }
                }
            )
            setMessages((oldMessages) => {
                return [...oldMessages, ...newMessages]
            })
        } catch (error) {
            console.log(error)
        }
    }

    async function getServerMembers() {
        const token = localStorage.getItem('token')
        const serverId = window.location.pathname.split('/')[2]

        try {
            const results = await api.get(`v1/servers/${serverId}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setMembers(results.data)
        } catch (error) {
            console.log(error)
        }
    }

    async function removeMemberById(memberId: string) {
        const token = localStorage.getItem('token')
        const serverId = window.location.pathname.split('/')[2]

        try {
            const results = await api.delete(
                `v1/servers/${serverId}/members/${memberId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            console.log('results.data: ', results.data)

            if (
                members.find((element) => element.id === results.data.id) !==
                undefined
            ) {
                const newMembersArray = members.filter((element) => {
                    return element.id === results.data.id
                })
                setMembers(newMembersArray)
                console.log(members)
            }
        } catch (error) {
            console.log('there was an error')
            console.log(error)
        }
    }

    async function getChannelName(channel: string) {
        try {
            const results = await api.get(`/v1/channels/${channel}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data: ChannelInfo = results.data
            setChannelName(data.name)
        } catch (error) {
            console.log(error)
        }
    }

    async function onMessageDelete(messageId: string) {
        try {
            const results = await api.delete(
                `v1/channels/${params.channelId}/messages/${messageId}`,
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
            const newArry: Array<Message> = messages.filter((message) => {
                if (message.id !== results.data.messageId) {
                    return message
                }
            })
            setMessages(newArry)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="h-full w-full ">
            <div className="h-[7%] border-b border-zinc-600 flex flex-row items-center justify-between px-4">
                <div className="h-full px-2">
                    <div className="flex flex-row items-center text-white h-full">
                        <Hash />
                        <span className="font-bold ml-2">{channelName}</span>
                    </div>
                </div>
            </div>
            <div className="h-[93%] flex flex-row">
                <div className="w-[75%] px-2 py-2 flex flex-col justify-end border-r border-zinc-600">
                    <div className="overflow-y-auto mb-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className="mb-4 flex flex-row justify-between items-center"
                            >
                                <div className="flex flex-row">
                                    <div className="mr-2">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                        </Avatar>
                                    </div>
                                    <div>
                                        <div className="flex flex-row">
                                            <p className="mr-2 text-white font-bold">
                                                {message.senderUsername}
                                            </p>
                                            <span className="text-zinc-500">
                                                {message.messageDate}
                                            </span>
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
                                                    onMessageDelete(message.id)
                                                }}
                                            >
                                                Delete Message
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-row border border-zinc-600 rounded-lg p-2">
                        <form
                            className="w-full h-full flex flex-row"
                            onSubmit={sendMessageForm.handleSubmit(
                                onMessageSend
                            )}
                        >
                            <FieldGroup>
                                <Controller
                                    name="message"
                                    control={sendMessageForm.control}
                                    render={({ field, fieldState }) => (
                                        <Field className="h-full">
                                            <Input
                                                className="border-0 h-full w-[100%] focus-visible:ring-0 text-white text-xl"
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder={`Message #${channelName}`}
                                            />
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </form>
                    </div>
                </div>
                <div className="flex flex-col w-[25%] px-2 py-4">
                    <div>
                        <p className="text-white font-bold mb-2">Members</p>
                        <div>
                            <Button className="w-full bg-zinc-600 mb-2">
                                {user?.username}
                            </Button>
                        </div>
                        {members.map((member, index) => (
                            <div className="w-full mb-2" key={index}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="w-full bg-zinc-600">
                                            <span>{member.username}</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>
                                            User {member.username}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <Button
                                                onClick={() => {
                                                    removeMemberById(member.id)
                                                }}
                                            >
                                                Kick Member
                                            </Button>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ServerChannel
