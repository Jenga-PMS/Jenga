import { Add } from "@suid/icons-material"
import { Card, CardHeader, CardContent, List, ListItem, ListItemButton, ListItemText, CardActions, IconButton, ListItemAvatar, Avatar } from "@suid/material"
import { useContext, createSignal, For } from "solid-js"
import { TicketResponseDTO } from "../api"
import { ProjectContext } from "../provider/ProjectProvider"
import { NewTicketDialog } from "./NewTicketDialog"
import { I18nContext } from "../provider/I18nProvider"

interface BacklogItemProps {
    ticket: TicketResponseDTO
}

const BacklogItem = (props: BacklogItemProps) => {
    const pCtx = useContext(ProjectContext)
    const i18n = useContext(I18nContext)

    return (
        <ListItem
            sx={{
                "transform": "translateZ(0)",
            }}
            draggable
            onDragStart={(event) => {
                const id = props.ticket.id
                if (id == null) return
                event.dataTransfer?.setData("text/plain", String(id))
                pCtx?.setSelectedTicket(() => props.ticket)
            }}
        >
            <ListItemButton
                onClick={() => pCtx?.setSelectedTicket(props.ticket)}
                selected={pCtx?.selectedTicket()?.id === props.ticket.id}
            >
                <ListItemAvatar>
                    <Avatar></Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={props.ticket.title}
                    secondary={`${i18n?.t("ticket.reporter")}: ${props.ticket.reporter} ${i18n?.t("ticket.assignee")}: ${props.ticket.assignee}`} />
            </ListItemButton>
        </ListItem>
    )
}

interface BacklogProps {
    tickets?: TicketResponseDTO[]
}

export const Backlog = (props: BacklogProps) => {

    const pCtx = useContext(ProjectContext)
    const i18n = useContext(I18nContext)

    const [open, setOpen] = createSignal(false)
    const tickets = () => props.tickets ?? pCtx?.tickets() ?? []

    return (
        <>
            <Card id="guide-backlog">
                <CardHeader title={i18n?.t("backlog.title")}></CardHeader>
                <CardContent>
                    <List>
                        <For each={tickets()}>
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
