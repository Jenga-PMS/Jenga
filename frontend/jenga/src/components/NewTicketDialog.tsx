import { Dialog, DialogTitle, DialogContent, Stack, TextField, FormControl, InputLabel, Select, MenuItem, DialogActions, Button } from "@suid/material"
import { Setter, useContext, createSignal, For } from "solid-js"
import { TicketPriority, TicketSize, TicketStatus, CreateTicketDTO, TicketDTO, TicketResourceService } from "../api"
import { ProjectContext } from "../provider/ProjectProvider"

interface NewTicketDialogProps {
    open: boolean
    setOpen: Setter<boolean>
}

export const NewTicketDialog = (props: NewTicketDialogProps) => {
    const pCtx = useContext(ProjectContext)

    const [title, setTitle] = createSignal("")
    const [desc, setDesc] = createSignal("")
    const [prio, setPrio] = createSignal(TicketPriority.MEDIUM)
    const [size, setSize] = createSignal(TicketSize.MEDIUM)
    const [status, setStatus] = createSignal(TicketStatus.OPEN)
    const [assignee, setAssignee] = createSignal("")

    return (
        <Dialog open={props.open} fullWidth>
            <DialogTitle title="New Ticket">New Ticket</DialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    <TextField name="title" label="title" value={title()} onChange={(event) => { setTitle(event.target.value) }}></TextField>
                    <TextField name="description" label="description" value={desc()} onChange={(event) => { setDesc(event.target.value) }} multiline></TextField>
                    <TextField name="assignee" label="assignee" value={assignee()} onChange={(event) => { setAssignee(event.target.value) }}></TextField>
                    <FormControl fullWidth>
                        <InputLabel id="prio-label">Priority</InputLabel>
                        <Select
                            labelId="prio-label"
                            value={prio()}
                            label="Priority"
                            onChange={(e) => setPrio(e.target.value as TicketPriority)}
                        >
                            <For each={Object.values(TicketPriority)}>
                                {(p) => <MenuItem value={p}>{p}</MenuItem>}
                            </For>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="size-label">Size</InputLabel>
                        <Select
                            labelId="size-label"
                            value={size()}
                            label="Size"
                            onChange={(e) => setSize(e.target.value as TicketSize)}
                        >
                            <For each={Object.values(TicketSize)}>
                                {(p) => <MenuItem value={p}>{p}</MenuItem>}
                            </For>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                            labelId="status-label"
                            value={status()}
                            label="Status"
                            onChange={(e) => setStatus(e.target.value as TicketStatus)}
                        >
                            <For each={Object.values(TicketStatus)}>
                                {(p) => <MenuItem value={p}>{p}</MenuItem>}
                            </For>
                        </Select>
                    </FormControl>
                </Stack>

            </DialogContent>
            <DialogActions>
                <Button onClick={() => { props.setOpen(false) }}>cancel</Button>
                <Button onClick={() => {
                    const createTicketDTO: CreateTicketDTO = {
                        projectName: pCtx?.selectedProject().name,
                        title: title(),
                        description: desc(),
                        priority: prio(),
                        size: size(),
                        status: status(),
                        assignee: assignee(),
                    }

                    const { assignee: name, ...rest } = createTicketDTO;
                    const ticket: TicketDTO = {
                        ...rest,
                        assigneeName: name,
                    };

                    TicketResourceService.postApiProjectsTickets(pCtx?.selectedProject().identifier ?? "", createTicketDTO)
                    pCtx?.setTickets(prev => [...prev, ticket])
                    props.setOpen(false)

                }}>create</Button>
            </DialogActions>
        </Dialog>
    )
}