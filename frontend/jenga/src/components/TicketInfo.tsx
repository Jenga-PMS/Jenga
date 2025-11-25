import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@suid/material"
import { For } from "solid-js"
import { TicketResponseDTO, TicketPriority, TicketSize, TicketStatus } from "../api"
import { InfoMode } from "../utils/utils"
interface TicketInfoProps {
    mode: InfoMode
    ticket: TicketResponseDTO
    onTicketChange: (next: TicketResponseDTO) => void
    onSubmit?: (next: TicketResponseDTO) => void
    formId?: string
}

export const TicketInfo = (props: TicketInfoProps) => {
    const formId = props.formId ?? "ticket-info-form"

    const isReadOnly = props.mode === InfoMode.ReadOnly

    const updateTicket = <K extends keyof TicketResponseDTO>(key: K, value: TicketResponseDTO[K]) => {
        const updatedTicket = { ...props.ticket, [key]: value }
        props.onTicketChange(updatedTicket)
    }

    return (
        <form
            id={formId}
            onSubmit={(event) => {
                event.preventDefault()
                props.onSubmit?.({ ...props.ticket })
            }}
        >
            <Stack spacing={1}>
                <TextField
                    name="title"
                    label="title"
                    value={props.ticket.title ?? ""}
                    onChange={(_, value) => updateTicket("title", value)}
                    required
                    disabled={isReadOnly}
                />
                <TextField
                    name="description"
                    label="description"
                    value={props.ticket.description ?? ""}
                    onChange={(_, value) => updateTicket("description", value)}
                    rows={5}
                    multiline
                    disabled={isReadOnly}
                />
                <TextField
                    name="assignee"
                    label="assignee"
                    value={props.ticket.assignee ?? ""}
                    onChange={(_, value) => updateTicket("assignee", value)}
                    disabled={isReadOnly}
                />
                <FormControl fullWidth>
                    <InputLabel id={`${formId}-priority-label`}>Priority</InputLabel>
                    <Select
                        labelId={`${formId}-priority-label`}
                        value={props.ticket.priority ?? TicketPriority.MEDIUM}
                        label="Priority"
                        onChange={(event) => updateTicket("priority", event.target.value as TicketPriority)}
                        disabled={isReadOnly}
                    >
                        <For each={Object.values(TicketPriority)}>
                            {(priority) => (
                                <MenuItem value={priority}>{priority}</MenuItem>
                            )}
                        </For>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id={`${formId}-size-label`}>Size</InputLabel>
                    <Select
                        labelId={`${formId}-size-label`}
                        value={props.ticket.size ?? TicketSize.MEDIUM}
                        label="Size"
                        onChange={(event) => updateTicket("size", event.target.value as TicketSize)}
                        disabled={isReadOnly}
                    >
                        <For each={Object.values(TicketSize)}>
                            {(size) => (
                                <MenuItem value={size}>{size}</MenuItem>
                            )}
                        </For>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id={`${formId}-status-label`}>Status</InputLabel>
                    <Select
                        labelId={`${formId}-status-label`}
                        value={props.ticket.status ?? TicketStatus.OPEN}
                        label="Status"
                        onChange={(event) => updateTicket("status", event.target.value as TicketStatus)}
                        disabled={isReadOnly}
                    >
                        <For each={Object.values(TicketStatus)}>
                            {(status) => (
                                <MenuItem value={status}>{status}</MenuItem>
                            )}
                        </For>
                    </Select>
                </FormControl>
            </Stack>
        </form>
    )
}
