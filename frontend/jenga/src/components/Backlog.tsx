import { Add } from "@suid/icons-material"
import { Card, CardHeader, CardContent, List, ListItem, ListItemButton, ListItemText, CardActions, IconButton, ListItemAvatar, Avatar } from "@suid/material"
import { useContext, createSignal, For } from "solid-js"
import { TicketResponseDTO } from "../api"
import { ProjectContext } from "../provider/ProjectProvider"
import { NewTicketDialog } from "./NewTicketDialog"

interface BacklogItemProps {
    ticket: TicketResponseDTO
}

const BacklogItem = (props: BacklogItemProps) => {
    const pCtx = useContext(ProjectContext)

    return (
        <ListItem
            draggable
            onDragStart={(event) => {
                const id = props.ticket.id
                if (id == null) return
                event.dataTransfer?.setData("text/plain", String(id))
                pCtx?.setSelectedTicket(() => props.ticket)
            }}
        >
            <ListItemButton onClick={() => pCtx?.setSelectedTicket(props.ticket)}>
                <ListItemAvatar>
                    <Avatar></Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={props.ticket.title}
                    secondary={`reporter: ${props.ticket.reporter} assignee: ${props.ticket.assignee}`} />
            </ListItemButton>
        </ListItem>
    )
}

interface BacklogProps {
    tickets?: TicketResponseDTO[]
}

export const Backlog = (props: BacklogProps) => {

    const pCtx = useContext(ProjectContext)

    const [open, setOpen] = createSignal(false)

    return (
        <>
            <Card>
                <CardHeader title="Backlog"></CardHeader>
                <CardContent>
                    <List>
                        <For each={pCtx?.tickets() ?? []}>
                            {
                                (t) => <BacklogItem ticket={t}></BacklogItem>
                            }
                        </For>
                    </List>
                </CardContent>
                <CardActions>
                    <IconButton onClick={() => setOpen(true)} disabled={!pCtx?.selectedProject()}>
                        <Add></Add>
                    </IconButton>
                </CardActions>
            </Card>
            <NewTicketDialog open={open()} setOpen={setOpen}></NewTicketDialog>
        </>
    )
}
