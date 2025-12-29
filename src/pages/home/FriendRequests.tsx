import api from '@/api/AxiosInstance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthenticationContext } from '@/providers/auth/AuthProvider'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router'

type FriendshipRequestDTO = {
    requestedName: string
    requesterName: string
    requesterId: string
}

const FriendRequests = () => {
    const { token, user } = useContext(AuthenticationContext)
    const params = useParams()

    const [friendsRequestsReceived, setFriendRequestsReceived] = useState<
        Array<FriendshipRequestDTO>
    >([])
    const [friendsRequestsSent, setFriendRequestsSent] = useState<
        Array<FriendshipRequestDTO>
    >([])

    useEffect(() => {
        getReceivedRequests()
        getSentRequests()
    }, [])

    async function getReceivedRequests() {
        try {
            const results = await api.get(
                `v1/friendships/${user?.id}/requests-received`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const received: Array<FriendshipRequestDTO> = results.data
            setFriendRequestsReceived(received)
            console.log(results)
        } catch (error) {}
    }
    async function getSentRequests() {
        try {
            const results = await api.get(
                `v1/friendships/${user?.id}/requests-sent`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const sent: Array<FriendshipRequestDTO> = results.data
            setFriendRequestsSent(sent)
            console.log(results)
        } catch (error) {}
    }

    async function onAcceptFriendRequest(friendship: FriendshipRequestDTO) {
        try {
            const results = await api.post(
                `v1/friendships/${user?.id}/accept-request`,
                friendship,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const removedFriendRequest = friendsRequestsReceived.filter(
                (item) => item.requesterId !== friendship.requesterId
            )
            setFriendRequestsReceived(removedFriendRequest)
        } catch (error) {
            console.log(error)
        }
    }
    async function onDeclineFriendRequest(friendship: FriendshipRequestDTO) {
        try {
            const results = await api.post(
                `v1/friendships/${user?.id}/accept-request`,
                friendship,
                { headers: { Authorization: `Bearer ${token}` } }
            )
        } catch (error) {
            console.log(error)
        }
    }
    async function onCancelFriendRequest(friendship: FriendshipRequestDTO) {
        try {
            const results = await api.post(
                `v1/friendships/${user?.id}/cancel-request`,
                friendship,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            console.log()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="h-full w-full">
            <div className="flex flex-row items-center h-[7%] border-b border-zinc-600 px-4 mb-4">
                <div className="flex flex-row items-center">
                    <div className="mr-2">
                        <p className="text-white">Friends Requests</p>
                    </div>
                </div>
            </div>
            <div className="h-[93%] px-5">
                <div>
                    <div className="w-full mb-8">
                        <p className="text-white ml-2 mb-3">Received</p>
                        <div>
                            {friendsRequestsReceived.map((data, index) => (
                                <div
                                    className="flex flex-row justify-between items-center bg-zinc-600 p-4 rounded-lg hover:bg-zinc-500"
                                    key={index}
                                >
                                    <p className="text-white">
                                        {data.requesterName}
                                    </p>
                                    <div className="flex flex-row">
                                        <Button
                                            className="mr-2"
                                            onClick={() =>
                                                onAcceptFriendRequest(data)
                                            }
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                onDeclineFriendRequest(data)
                                            }
                                        >
                                            Decline
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full pb-2">
                        <p className="text-white ml-2 mb-3">Sent</p>
                    </div>
                    <div>
                        {friendsRequestsSent.map((data, index) => (
                            <div
                                className="flex flex-row justify-between items-center bg-zinc-600 p-4 rounded-lg hover:bg-zinc-500"
                                key={index}
                            >
                                <p className="text-white">
                                    {data.requestedName}
                                </p>
                                {/* <Button
                                    onClick={() => onCancelFriendRequest(data)}
                                >
                                    Cancel
                                </Button> */}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FriendRequests
