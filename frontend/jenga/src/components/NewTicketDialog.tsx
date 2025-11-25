import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@suid/material"
import { Setter, useContext, createSignal, createEffect } from "solid-js"
import { TicketPriority, TicketSize, TicketStatus, TicketRequestDTO, TicketResponseDTO, TicketResourceService } from "../api"
import { ProjectContext } from "../provider/ProjectProvider"
import { TicketInfo } from "./TicketInfo"
import { InfoMode } from "../utils/utils"

interface NewTicketDialogProps {
    open: boolean
    setOpen: Setter<boolean>
}

export const NewTicketDialog = (props: NewTicketDialogProps) => {
    const pCtx = useContext(ProjectContext)

    const EMPTY_TICKET: TicketResponseDTO = {
        title: "",
        description: "",
        priority: TicketPriority.MEDIUM,
        size: TicketSize.MEDIUM,
        status: TicketStatus.OPEN,
        assignee: "",
    }

    const formId = "new-ticket-form"
    const [ticket, setTicket] = createSignal<TicketResponseDTO>({ ...EMPTY_TICKET })

    createEffect(() => {
        if (props.open) {
            setTicket(() => ({
                ...EMPTY_TICKET,
                projectName: pCtx?.selectedProject().name,
            }))
        }
    })

    const onCreate = async (draft?: TicketResponseDTO) => {
        const source = draft ?? ticket()
        const request: TicketRequestDTO = {
            projectName: pCtx?.selectedProject().name,
            title: source.title ?? "",
            description: source.description ?? "",
            priority: source.priority ?? TicketPriority.MEDIUM,
            size: source.size ?? TicketSize.MEDIUM,
            status: source.status ?? TicketStatus.OPEN,
            assignee: source.assignee ?? "",
        }

        const newTicket = await TicketResourceService.postApiTickets(pCtx?.selectedProject().identifier ?? "", request)
        pCtx?.setTickets(prev => [...prev ?? [], newTicket])
        props.setOpen(false)
    }

    return (
        <Dialog open={props.open} fullWidth>
            <DialogTitle title="New Ticket">New Ticket</DialogTitle>
            <DialogContent>
                <TicketInfo
                    mode={InfoMode.Create}
                    formId={formId}
                    ticket={ticket()}
                    onTicketChange={setTicket}
                    onSubmit={onCreate}
                />
            </DialogContent>
            <DialogActions>
                <Button type="button" onClick={() => { props.setOpen(false) }}>cancel</Button>
                <Button type="submit" form={formId}>create</Button>
            </DialogActions>
        </Dialog>
    )
}
