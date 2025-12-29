import * as React from 'react'
import * as signalR from '@microsoft/signalr'
import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const ChatTwo = () => {
    const [userId, setUserId] = useState(1)
    const [chatRoom, setChatRoom] = useState('chat2')
    const [username, setUsername] = useState('')
    const [message, setMessage] = useState('')
    const [connection, setConnection] = useState<signalR.HubConnection | null>(
        null
    )

    useEffect(() => {
        if (connection) return

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:7008/chatHub')
            .withAutomaticReconnect()
            .build()

        setConnection(newConnection)
    }, [])

    useEffect(() => {
        if (connection) {
            connection
                .start()
                .then(() => {
                    // connection.invoke("GetConnectionId").then((id) => {
                    //   console.log(`connection id: ${id}`);
                    // });
                    connection
                        .invoke('JoinRoom', 'chat2')
                        .then(() => {
                            console.log('joining chat room two')
                        })
                        .catch((err) => {
                            console.error(`error joining room: ${err}`)
                        })
                    console.log('Connected')

                    connection.on('ReceiveMessage', (user, message) => {
                        console.log(
                            `Received notification from ${user}: ${message}`
                        )
                    })

                    connection.on(
                        'ReceiveGroupMessage',
                        (user, message, roomName) => {
                            console.log(
                                `Received message in group ${user} from user ${message}. Message: ${roomName}`
                            )
                        }
                    )
                })
                .catch((error) => {
                    console.error(error)
                })
        }
    }, [connection])

    useEffect(() => {
        return () => {
            connection?.stop().then(() => {
                console.log('disconnecting from chat two')
            })
        }
    }, [])

    const messages = [
        {
            messageId: 1,
            userId: 1,
            username: 'KamNotKam',
            messageContent: "Yooo, what's up everyone?",
            date: '10/4/2025',
            time: '6:48PM',
        },
        {
            messageId: 2,
            userId: 1,
            username: 'KamNotKam',
            messageContent: 'Is anyone else here?...',
            date: '10/4/2025',
            time: '6:51PM',
        },
        {
            messageId: 3,
            userId: 2,
            username: 'JeffGust95',
            messageContent: 'Hey, how are you bro?',
            date: '10/4/2025',
            time: '6:52PM',
        },
        {
            messageId: 4,
            userId: 1,
            username: 'KamNotKam',
            messageContent: 'finally some life lol',
            date: '10/4/2025',
            time: '6:52PM',
        },
        {
            messageId: 5,
            userId: 1,
            username: 'KamNotKam',
            messageContent: 'im chillin man',
            date: '10/4/2025',
            time: '6:53PM',
        },
    ]
    return (
        <div className="bg-gray-700 h-full">
            <div className="flex flex-col items-start justify-center p-5 bg-gray-800 h-[10%]">
                <h1 className="font-bold text-white text-xl">Chatroom Two</h1>
            </div>
            <div className="flex flex-row justify-start h-[90%] w-full p-5">
                <div className="w-[10%]">
                    <Button>Call One</Button>
                </div>
                <div className="flex flex-col justify-end w-[90%]">
                    <div className="flex flex-col items-center">
                        {messages.map((data, index) => {
                            return (
                                <div
                                    className="flex flex-col mb-4 w-full"
                                    key={index}
                                >
                                    <div className="flex flex-row">
                                        <div className="mr-5">
                                            <p className="text-sm">
                                                {data.username}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm">
                                                {data.time}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-lg text-white">
                                            {data.messageContent}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex flex-col items-center w-full">
                        <div className="mb-2 w-[50%]">
                            <Input
                                className=""
                                placeholder="name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="w-[50%] mb-2">
                            <Textarea
                                className=""
                                placeholder="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                        <div className="w-[20%]">
                            <Button
                                className="w-full bg-gray-900"
                                onClick={() => {
                                    connection
                                        ?.invoke(
                                            'SendGroupMessage',
                                            username,
                                            message,
                                            chatRoom
                                        )
                                        .then(() => {
                                            console.log('message sent')
                                        })
                                        .catch((err) => {
                                            console.error(err)
                                        })
                                }}
                            >
                                Send
                            </Button>
                        </div>
                        <div>
                            <Button
                                onClick={() => {
                                    console.log(
                                        `id: ${connection?.connectionId}`
                                    )
                                }}
                            >
                                Check Connection
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatTwo
