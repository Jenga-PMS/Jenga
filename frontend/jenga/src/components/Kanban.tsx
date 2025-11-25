import { TableRow, TableCell, Card, CardHeader, CardContent, TableContainer, Paper, Table, TableHead, TableBody, ListItem, List, ListItemButton } from "@suid/material"
import { useContext, createMemo, For } from "solid-js"
import { TicketResponseDTO, TicketStatus } from "../api"
import { ProjectContext } from "../provider/ProjectProvider"

interface KanbanItemProps {
    ticket: TicketResponseDTO
}

const KanbanItem = (props: KanbanItemProps) => {
    const pCtx = useContext(ProjectContext)

    return (
        <ListItem
            sx={{ "border": "1px solid black" }}
            draggable
            onDragStart={(event) => {
                const id = props.ticket.id
                if (id == null) return
                event.dataTransfer?.setData("text/plain", String(id))
                pCtx?.setSelectedTicket(() => props.ticket)
            }}
        >
            <ListItemButton onClick={() => pCtx?.setSelectedTicket(props.ticket)}>
                {props.ticket.title}
            </ListItemButton>
        </ListItem>
    )
}


interface KanbanCellProps {
    tickets?: TicketResponseDTO[]
    status: TicketStatus
    username: string
}

const StatusCell = (props: KanbanCellProps) => {
    const pCtx = useContext(ProjectContext)

    return (
        <TableCell
            sx={{ "border": "1px solid black" }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
                event.preventDefault()
                const raw = event.dataTransfer?.getData("text/plain")
                const ticketId = raw ? Number(raw) : NaN
                if (Number.isNaN(ticketId)) return

                const ticket = pCtx?.tickets()?.find((item) => item.id === ticketId)
                if (!ticket) return

                const statusUnchanged = ticket.status === props.status
                const assigneeUnchanged = ticket.assignee === props.username
                if (statusUnchanged && assigneeUnchanged) return

                const projectId = pCtx?.selectedProject()?.identifier
                if (!projectId) return

                const updated: TicketResponseDTO = { ...ticket, status: props.status, assignee: props.username }
                pCtx?.setTickets((prev) => prev?.map((entry) => (entry.id === ticketId ? updated : entry)) ?? prev)
                if (pCtx?.selectedTicket()?.id === ticketId) pCtx?.setSelectedTicket(() => updated)
                void pCtx?.updateTicket(projectId, updated)
            }}
        >
            <List>
                <For each={props.tickets?.filter(t => t.status === props.status)}>
                    {(ticket) => (
                        <KanbanItem ticket={ticket} />
                    )}
                </For>
            </List>
        </TableCell>
    )
}

interface RowProps {
    dev: string
    tickets?: TicketResponseDTO[]
}

const Row = (props: RowProps) => {
    return (
        <TableRow>
            <TableCell>{props.dev}</TableCell>
            <StatusCell tickets={props.tickets} status={TicketStatus.OPEN} username={props.dev} />
            <StatusCell tickets={props.tickets} status={TicketStatus.IN_PROGRESS} username={props.dev} />
            <StatusCell tickets={props.tickets} status={TicketStatus.IN_REVIEW} username={props.dev} />
            <StatusCell tickets={props.tickets} status={TicketStatus.RESOLVED} username={props.dev} />
            <StatusCell tickets={props.tickets} status={TicketStatus.CLOSED} username={props.dev} />
        </TableRow>
    )
}


export const Kanban = () => {

    const pCtx = useContext(ProjectContext)

    const tickets = createMemo(() =>
        Map.groupBy(pCtx?.tickets() ?? [], t => t.assignee ?? "")
    )

    return (
        <Card>
            <CardHeader title="Kanban"></CardHeader>
            <CardContent>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Dev</TableCell>
                                <TableCell>Todo</TableCell>
                                <TableCell>In Progress</TableCell>
                                <TableCell>In Review</TableCell>
                                <TableCell>Resolved</TableCell>
                                <TableCell>Done</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <For each={[...tickets().entries()]}>
                                {
                                    t => <Row dev={t[0]} tickets={t[1]}></Row>
                                }
                            </For>
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    )
}
