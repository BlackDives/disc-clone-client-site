import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogHeader,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog'
import { type Dispatch, type SetStateAction } from 'react'

type DeleteChannelDialogProps = {
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
    channelId: string
    channelName: string
}

const DeleteChannelDialog = ({
    isOpen,
    setIsOpen,
    channelName,
}: DeleteChannelDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{`Delete #${channelName}`}</DialogTitle>
                    <DialogDescription>
                        Remove channel from server
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <p className="mb-4">
                        Do you want to remove this channel permanently from the
                        server?
                    </p>
                    <div className="flex flex-row justify-between">
                        <Button
                            className="bg-red-600"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button>Confirm</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteChannelDialog
