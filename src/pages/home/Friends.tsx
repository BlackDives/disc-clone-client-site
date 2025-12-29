import api from '@/api/AxiosInstance'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { AuthenticationContext } from '@/providers/auth/AuthProvider'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

type FriendshipDTO = {
    friendOneId: string
    friendOneName: string
    friendTwoId: string
    friendTwoName: string
    createdAt: Date
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

const Friends = () => {
    const { user, token } = useContext(AuthenticationContext)
    const navigate = useNavigate()
    const [friends, setFriends] = useState<Array<FriendshipDTO>>([])

    useEffect(() => {
        getFriends()
    }, [])

    async function getFriends() {
        try {
            const results = await api.get(
                `v1/friendships/${user?.id}/friends`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            console.log(results)
            setFriends(results.data)
        } catch (error) {
            console.log(error)
        }
    }

    async function onRemoveFriend(friendshipDTO: FriendshipDTO) {
        try {
            const results = await api.post(
                `v1/friendships/${user?.id}/remove-friend`,
                friendshipDTO,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            console.log(results)
            const newFriendsArray = friends.filter(
                (friend) =>
                    (friend.friendOneId == friendshipDTO.friendOneId &&
                        friend.friendTwoId == friendshipDTO.friendTwoId) ||
                    (friend.friendTwoId === friendshipDTO.friendOneId &&
                        friend.friendOneId === friendshipDTO.friendTwoId)
            )
            setFriends(newFriendsArray)
            toast.success('Friend removed')
        } catch (error) {
            console.log(error)
            toast.error('Error removing friend')
        }
    }

    async function onDirectMessageFriend(friendshipDTO: FriendshipDTO) {
        const directMessageChannel: DirectMessageChannelDTO = {
            id: '',
            userOneId: friendshipDTO.friendOneId,
            userOneUsername: friendshipDTO.friendOneName,
            userTwoId: friendshipDTO.friendTwoId,
            userTwoUsername: friendshipDTO.friendTwoName,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        try {
            const results = await api.post(
                `v1/direct_messages/${user?.id}`,
                directMessageChannel,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            const newDirectMessageChannel: DirectMessageChannelDTO =
                results.data
            navigate(`/channels/me/${newDirectMessageChannel.id}`)
            console.log(newDirectMessageChannel)
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

    return (
        <div className="h-full w-full">
            <div className="flex flex-row items-center h-[7%] border-b border-zinc-600 px-4">
                <div className="flex flex-row items-center">
                    <div className="mr-2">
                        <p className="text-white">Friends</p>
                    </div>
                </div>
            </div>
            <div className="h-[93%] px-5">
                <div>
                    <div className="w-full mb-3">
                        <p className="text-white ml-2">Friends</p>
                    </div>
                    <div>
                        {friends.map((data, index) => (
                            <div
                                className="flex flex-row justify-between items-center bg-zinc-600 p-4 rounded-lg hover:bg-zinc-500"
                                key={index}
                            >
                                <p className="text-white">
                                    {data.friendOneId == user?.id
                                        ? data.friendTwoName
                                        : data.friendOneName}
                                </p>
                                <div>
                                    <Button
                                        className="mr-2"
                                        onClick={() => {
                                            onDirectMessageFriend(data)
                                        }}
                                    >
                                        Message
                                    </Button>
                                    <Button
                                        onClick={() => onRemoveFriend(data)}
                                    >
                                        Remove Friend
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Friends
