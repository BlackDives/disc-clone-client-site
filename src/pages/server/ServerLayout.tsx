import React, { useContext, useEffect, useState } from 'react'
import api from '@/api/AxiosInstance'
import { Link, Outlet, useParams, useNavigate } from 'react-router'
import * as signalR from '@microsoft/signalr'
import * as z from 'zod'
import { useForm, Controller } from 'react-hook-form'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    ChevronDown,
    ChevronRight,
    Hash,
    Cog,
    Plus,
    Volume2,
} from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field'
import { AuthenticationContext } from '@/providers/auth/AuthProvider'
import DeleteServer from './DeleteServer'
import DeleteChannelDialog from './DeleteChannelDialog'
import { toast } from 'sonner'
import ServerChannel from './ServerChannel'

type Channel = {
    id: string
    name: string
    type: string
}

const createChannelSchema = z.object({
    channelName: z
        .string()
        .min(5, 'Channel name must be at least 5 characters')
        .max(25, 'Channel must be at most 25 characters'),
    channelType: z.enum(['Text', 'Voice']),
})

const inviteUserSchema = z.object({
    username: z
        .string('Please enter a username')
        .min(1, 'Enter a valid username'),
})

const deleteServerSchema = z.object({
    serverName: z.string('Please enter the name of the server'),
})

const ServerLayout = () => {
    const params = useParams()
    const navigate = useNavigate()

    const { token, user } = useContext(AuthenticationContext)
    const [isOpened, setIsOpened] = useState(false)
    const [voiceChannelIsOpen, setVoiceChannelIsOpen] = useState<boolean>(false)
    const [isCreateChannelDialogOpen, setIsCreateChannelDialogOpen] =
        useState<boolean>(false)
    const [isDeleteChannelDialogOpen, setIsDeleteChannelDialogOpen] =
        useState<boolean>(false)
    const [channels, setChannels] = useState<Array<Channel>>([])
    const [serverId, setServerId] = useState(params.serverId)
    const [serverOwnerId, setServerOwnerId] = useState<string>('')
    const [serverName, setServerName] = useState<string>('')
    const [isDeleteServerDialogOpen, setIsDeleteServerDialogOpen] =
        useState<boolean>(false)

    useEffect(() => {
        getServerChannels()
        if (params.serverId) {
            getServerName(params.serverId)
        }
    }, [params.serverId])

    useEffect(() => {
        console.log(
            `serverId being rendered: ${window.location.pathname.split('/')[2]}`
        )
    }, [params.serverId])

    const createChannelForm = useForm<z.infer<typeof createChannelSchema>>({
        resolver: zodResolver(createChannelSchema),
        defaultValues: {
            channelName: '',
            channelType: 'Text',
        },
    })

    const inviteMemberForm = useForm<z.infer<typeof inviteUserSchema>>({
        resolver: zodResolver(inviteUserSchema),
        defaultValues: {
            username: '',
        },
    })

    const deleteServerForm = useForm<z.infer<typeof deleteServerSchema>>({
        resolver: zodResolver(deleteServerSchema),
        defaultValues: { serverName: '' },
    })

    async function getServerChannels() {
        const results = await api.get(
            `v1/servers/${params.serverId}/channels`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        )
        console.log(results.data)
        setChannels(results.data)
        const textChannels = channels.filter(
            (channel) => channel.type === 'Text'
        )
    }

    async function getServerName(id: string) {
        try {
            var results = await api.get(`v1/servers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setServerName(results.data.name)
            setServerOwnerId(results.data.serverOwnerId)
        } catch (error) {
            console.log(error)
        }
    }

    async function onCreateChannelFormSubmit(
        data: z.infer<typeof createChannelSchema>
    ) {
        const newChannel = {
            id: '',
            name: data.channelName,
            type: data.channelType,
        }
        try {
            const results = await api.post(
                `v1/servers/${params.serverId}/channels`,
                newChannel,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const channelToAdd: Channel = {
                id: results.data.id,
                name: results.data.name,
                type: results.data.type === 1 ? 'Text' : 'Voice',
            }
            setIsCreateChannelDialogOpen(false)
            toast.success('Channel successfully created')
            setChannels((oldChannels) => [...oldChannels, channelToAdd])
            console.log(results.data)
        } catch (error) {
            console.log(error)
        }
    }

    async function onInviteUser(data: z.infer<typeof inviteUserSchema>) {
        try {
            var results = await api.post(
                `v1/servers/${serverId}/invite`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            )
        } catch (error) {
            console.log(error)
        }
    }

    async function onDeleteServer(data: z.infer<typeof deleteServerSchema>) {
        try {
            console.log(data)
            if (data.serverName !== serverName) {
                toast.error('Invalid server name entered')
                deleteServerForm.reset()
                setIsDeleteServerDialogOpen(false)
            } else {
                const results = await api.delete(
                    `v1/servers/${params.serverId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )

                console.log(`Deleting server results`, results)
            }
            toast.success('Server successfully deleted')
            setIsDeleteServerDialogOpen(false)
            navigate('/channels/me')
        } catch (error) {
            console.log(error)
        }
    }

    const toggleCollapsible = () => {
        if (isOpened) {
            setIsOpened(false)
        } else {
            setIsOpened(true)
        }
    }

    function voiceChannelCollapsible() {
        if (voiceChannelIsOpen) {
            setVoiceChannelIsOpen(false)
        } else {
            setVoiceChannelIsOpen(true)
        }
    }

    return (
        <div className="w-full h-full flex flex-row border-1 border-zinc-600 rounded-xl bg-clip-padding rounded-b-none rounded-r-none border-b-0 border-r-0">
            <div className="w-[20%] bg-zinc-800 rounded-xl rounded-b-none">
                <div className="flex flex-row items-center w-full mb-2 p-2 border-b border-zinc-600 h-[7%]">
                    <Dialog>
                        <Dialog
                            open={isDeleteServerDialogOpen}
                            onOpenChange={setIsDeleteServerDialogOpen}
                        >
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete Server</DialogTitle>
                                    <DialogDescription>
                                        Delete your server
                                    </DialogDescription>
                                </DialogHeader>
                                <div>
                                    <form
                                        onSubmit={deleteServerForm.handleSubmit(
                                            onDeleteServer
                                        )}
                                    >
                                        <FieldGroup>
                                            <Controller
                                                name="serverName"
                                                control={
                                                    deleteServerForm.control
                                                }
                                                render={({
                                                    field,
                                                    fieldState,
                                                }) => (
                                                    <Field>
                                                        <FieldLabel>
                                                            Enter server name
                                                        </FieldLabel>
                                                        <Input
                                                            {...field}
                                                            placeholder="Server name...."
                                                        />
                                                        {fieldState.error && (
                                                            <FieldError
                                                                errors={[
                                                                    fieldState.error,
                                                                ]}
                                                            />
                                                        )}
                                                    </Field>
                                                )}
                                            />
                                        </FieldGroup>
                                    </form>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <p className="text-white text-lg font-bold">
                                    {serverName}
                                </p>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Options</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <DialogTrigger asChild>
                                        <Button>Invite Member</Button>
                                    </DialogTrigger>
                                </DropdownMenuItem>
                                {user?.id === serverOwnerId && (
                                    <DropdownMenuItem>
                                        <Button
                                            onClick={() =>
                                                setIsDeleteServerDialogOpen(
                                                    true
                                                )
                                            }
                                        >
                                            Delete Server
                                        </Button>
                                    </DropdownMenuItem>
                                )}
                                {user?.id !== serverOwnerId && (
                                    <DropdownMenuItem>
                                        <Button>Leave Server</Button>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Invite New Member</DialogTitle>
                                <DialogDescription>
                                    Invite new member by typing their username
                                </DialogDescription>
                            </DialogHeader>
                            <div>
                                <form
                                    onSubmit={inviteMemberForm.handleSubmit(
                                        onInviteUser
                                    )}
                                >
                                    <FieldGroup>
                                        <Controller
                                            name="username"
                                            control={inviteMemberForm.control}
                                            render={({ field, fieldState }) => (
                                                <Field>
                                                    <FieldLabel>
                                                        Enter Username
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        placeholder="Enter username...."
                                                    />
                                                    {fieldState.error && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                    </FieldGroup>
                                </form>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="w-full">
                    <div className="w-full flex flex-row items-center">
                        <Collapsible open={isOpened} className="w-full">
                            <div className="flex flex-row justify-between w-full">
                                <div className="flex flex-row">
                                    <CollapsibleTrigger
                                        asChild
                                        className="w-full"
                                    >
                                        <Button
                                            className="flex flex-row w-full justify-between text-white bg-transparent hover:bg-transparent"
                                            onClick={toggleCollapsible}
                                        >
                                            <div className="flex flex-row items-center  hover:text-zinc-600">
                                                <div className="flex flex-row mr-2">
                                                    <span>Text Channels</span>
                                                </div>
                                                {isOpened ? (
                                                    <ChevronDown />
                                                ) : (
                                                    <ChevronRight />
                                                )}
                                            </div>
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                                <div>
                                    <Button
                                        className="bg-transparent hover:bg-transparent hover:text-zinc-600"
                                        onClick={() =>
                                            setIsCreateChannelDialogOpen(true)
                                        }
                                    >
                                        <Plus />
                                    </Button>
                                </div>
                            </div>
                            <CollapsibleContent>
                                <div className="px-2">
                                    {channels?.map(
                                        (channel, index) =>
                                            channel.type === 'Text' && (
                                                <div
                                                    key={index}
                                                    className="flex flex-row justify-between items-center"
                                                >
                                                    <Link to={channel.id}>
                                                        <div className="flex flex-row items-center text-white hover:text-zinc-500">
                                                            <Hash size={16} />
                                                            <p className="ml-2">
                                                                {channel.name}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                    <div>
                                                        <Button
                                                            className="bg-transparent py-[0px]"
                                                            onClick={() =>
                                                                setIsDeleteChannelDialogOpen(
                                                                    true
                                                                )
                                                            }
                                                        >
                                                            <Cog
                                                                size={12}
                                                                color="white"
                                                            />
                                                        </Button>
                                                        <DeleteChannelDialog
                                                            channelId={
                                                                channel.id
                                                            }
                                                            channelName={
                                                                channel.name
                                                            }
                                                            isOpen={
                                                                isDeleteChannelDialogOpen
                                                            }
                                                            setIsOpen={
                                                                setIsDeleteChannelDialogOpen
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            )
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                        <Dialog
                            open={isCreateChannelDialogOpen}
                            onOpenChange={setIsCreateChannelDialogOpen}
                        >
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Create New Channel
                                    </DialogTitle>
                                    <DialogDescription>
                                        Create a new channel for your server!
                                    </DialogDescription>
                                </DialogHeader>
                                <div>
                                    <form
                                        id="create-channel-form"
                                        onSubmit={createChannelForm.handleSubmit(
                                            onCreateChannelFormSubmit
                                        )}
                                    >
                                        <FieldGroup>
                                            <Controller
                                                name="channelName"
                                                control={
                                                    createChannelForm.control
                                                }
                                                render={({
                                                    field,
                                                    fieldState,
                                                }) => (
                                                    <Field>
                                                        <FieldLabel>
                                                            Channel Name
                                                        </FieldLabel>
                                                        <Input
                                                            {...field}
                                                            aria-invalid={
                                                                fieldState.invalid
                                                            }
                                                            placeholder="Channel Name"
                                                        />
                                                        {fieldState.error && (
                                                            <FieldError
                                                                errors={[
                                                                    fieldState.error,
                                                                ]}
                                                            />
                                                        )}
                                                    </Field>
                                                )}
                                            />
                                            <Controller
                                                name="channelType"
                                                control={
                                                    createChannelForm.control
                                                }
                                                render={({
                                                    field,
                                                    fieldState,
                                                }) => (
                                                    <Field
                                                        data-invalid={
                                                            fieldState.invalid
                                                        }
                                                    >
                                                        <FieldContent>
                                                            <FieldLabel>
                                                                Channel Type
                                                            </FieldLabel>
                                                        </FieldContent>
                                                        <Select
                                                            name={field.name}
                                                            value={field.value}
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                        >
                                                            <SelectTrigger
                                                                aria-invalid={
                                                                    fieldState.invalid
                                                                }
                                                            >
                                                                <SelectValue placeholder="Select a channel type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Text">
                                                                    Text Channel
                                                                </SelectItem>
                                                                <SelectItem value="Voice">
                                                                    Voice
                                                                    Channel
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {fieldState.invalid && (
                                                            <FieldError
                                                                errors={[
                                                                    fieldState.error,
                                                                ]}
                                                            />
                                                        )}
                                                    </Field>
                                                )}
                                            />
                                        </FieldGroup>
                                    </form>
                                </div>
                                <DialogFooter>
                                    <div className="w-full flex flex-row justify-between">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            form="create-channel-form"
                                        >
                                            Submit
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div>
                        <Collapsible>
                            <div className="flex flex-row justify-between w-full">
                                <div className="flex flex-row">
                                    <CollapsibleTrigger
                                        asChild
                                        className="w-full"
                                    >
                                        <Button
                                            className="flex flex-row w-full justify-between text-white bg-transparent hover:bg-transparent"
                                            onClick={voiceChannelCollapsible}
                                        >
                                            <div className="flex flex-row items-center  hover:text-zinc-600">
                                                <div className="flex flex-row mr-2">
                                                    <span>Voice Channels</span>
                                                </div>
                                                {voiceChannelIsOpen ? (
                                                    <ChevronDown />
                                                ) : (
                                                    <ChevronRight />
                                                )}
                                            </div>
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                                <div>
                                    <Button
                                        className="bg-transparent hover:bg-transparent hover:text-zinc-600"
                                        onClick={() =>
                                            setIsCreateChannelDialogOpen(true)
                                        }
                                    >
                                        <Plus />
                                    </Button>
                                </div>
                            </div>
                            <CollapsibleContent>
                                <div className="px-2">
                                    {channels?.map(
                                        (channel, index) =>
                                            channel.type === 'Voice' && (
                                                <div
                                                    key={index}
                                                    className="flex flex-row justify-between items-center mb-2"
                                                >
                                                    <Button className="flex flex-row justify-start bg-transparent hover:bg-transparent text-md p-0 font-light">
                                                        <div className="flex flex-row items-center text-white hover:text-zinc-500">
                                                            <Volume2
                                                                size={16}
                                                            />
                                                            <p className="ml-2">
                                                                {channel.name}
                                                            </p>
                                                        </div>
                                                    </Button>
                                                    <div>
                                                        <Button className="bg-transpent hover:bg-transparent hover:text-zinc-600">
                                                            <Cog
                                                                size={16}
                                                                color="white"
                                                            />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </div>
            </div>

            <div className="w-[80%] bg-zinc-700">
                <Outlet />
            </div>
        </div>
    )
}

export default ServerLayout
