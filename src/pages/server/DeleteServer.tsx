import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@radix-ui/react-dialog'
import { DialogHeader } from '@/components/ui/dialog'

type DeleteServerComponentProps = {
    isOpen: boolean
    setOpen: any
}
const DeleteServer = ({ isOpen, setOpen }: DeleteServerComponentProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Server</DialogTitle>
                    <DialogDescription>Delete your server</DialogDescription>
                </DialogHeader>
                <div>To delete your server, enter the name of the server</div>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteServer
