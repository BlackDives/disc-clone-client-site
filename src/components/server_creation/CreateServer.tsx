import { useContext, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import api from '@/api/AxiosInstance'
import * as z from 'zod'
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
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthenticationContext } from '@/providers/auth/AuthProvider'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'

const createServerSchema = z.object({
    serverName: z.string().min(5, 'Server name must be atleast 5 characters'),
})

const CreateServer = () => {
    const { user, token } = useContext(AuthenticationContext)
    const [isCreateServerDialogOpen, setIsCreateServerDialogOpen] =
        useState<boolean>(false)
    const navigate = useNavigate()
    const form = useForm<z.infer<typeof createServerSchema>>({
        resolver: zodResolver(createServerSchema),
        defaultValues: {
            serverName: '',
        },
    })

    const onFormSubmit = async (data: z.infer<typeof createServerSchema>) => {
        const server = {
            id: '',
            name: data.serverName,
            serverOwnerId: user?.id,
        }
        console.log(server)
        try {
            const results = await api.post('v1/servers', server, {
                headers: { Authorization: `Bearer ${token}` },
            })
            console.log(results)
            form.reset()
            navigate(`/channels/${results.data.id}`)
            setIsCreateServerDialogOpen(false)
            toast.success('Server created successfully!')
        } catch (error) {
            toast.error('Error creating server')
        }
    }

    return (
        <Dialog
            open={isCreateServerDialogOpen}
            onOpenChange={setIsCreateServerDialogOpen}
        >
            <form
                id="create-server-form"
                onSubmit={form.handleSubmit(onFormSubmit)}
            >
                <DialogTrigger asChild>
                    <Button>+</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Server</DialogTitle>
                        <DialogDescription>
                            Create new server!
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <FieldGroup>
                            <Controller
                                name="serverName"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Server Name</FieldLabel>
                                        <Input
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Enter new server name..."
                                            autoComplete="off"
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
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button>Cancel</Button>
                        </DialogClose>
                        <Button form="create-server-form" type="submit">
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}

export default CreateServer
