import { Add, Delete } from "@suid/icons-material"
import { Checkbox, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@suid/material"
import { For, Index, Setter, createEffect, createSignal, useContext } from "solid-js"
import { TicketResponseDTO, TicketPriority, TicketSize, TicketStatus } from "../api"
import { InfoMode } from "../utils/utils"
import { SearchUser } from "./SearchUser"
import { LabelSelector } from "./Labels"
import { I18nContext } from "../provider/I18nProvider"
interface TicketInfoProps {
    mode: InfoMode
    ticket: TicketResponseDTO
    onTicketChange: (next: TicketResponseDTO) => void
    onSubmit?: (next: TicketResponseDTO) => void
    formId?: string
}

export const TicketInfo = (props: TicketInfoProps) => {
    const formId = props.formId ?? "ticket-info-form"
    const i18n = useContext(I18nContext)

    const isReadOnly = props.mode === InfoMode.ReadOnly

    const setField = <K extends keyof TicketResponseDTO>(key: K, value: TicketResponseDTO[K]) => {
        props.onTicketChange({ ...props.ticket, [key]: value })
    }

    const setLabels: Setter<string[]> = (next) => {
        const current = props.ticket.labels ?? []
        const labels = typeof next === "function" ? next(current) : next
        setField("labels", labels)
        return labels
    }

    const formatTicketIds = (ids: number[] | undefined) => (ids ?? []).join(", ")

    const parseTicketIds = (value: string): number[] => {
        if (!value.trim()) return []

        const uniqueIds = new Set<number>()
        value
            .split(",")
            .map((part) => Number(part.trim()))
            .filter((id) => Number.isInteger(id) && id > 0)
            .forEach((id) => uniqueIds.add(id))

        return [...uniqueIds]
    }

    type TicketIdField = "relatedTicketsIds" | "blockingTicketIds" | "blockedTicketIds"
    const [ticketIdInputs, setTicketIdInputs] = createSignal({
        relatedTicketsIds: "",
        blockingTicketIds: "",
        blockedTicketIds: "",
    })

    createEffect(() => {
        setTicketIdInputs({
            relatedTicketsIds: formatTicketIds(props.ticket.relatedTicketsIds),
            blockingTicketIds: formatTicketIds(props.ticket.blockingTicketIds),
            blockedTicketIds: formatTicketIds(props.ticket.blockedTicketIds),
        })
    })

    const commitTicketIds = (key: TicketIdField) => {
        const value = ticketIdInputs()[key]
        const parsed = parseTicketIds(value)
        setField(key, parsed)
        setTicketIdInputs((prev) => ({ ...prev, [key]: formatTicketIds(parsed) }))
    }

    const criteria = () => props.ticket.acceptanceCriteria ?? []

    return (
        <form
            id={formId}
            onSubmit={(event) => {
                event.preventDefault()
                const nextRelated = parseTicketIds(ticketIdInputs().relatedTicketsIds)
                const nextBlocking = parseTicketIds(ticketIdInputs().blockingTicketIds)
                const nextBlocked = parseTicketIds(ticketIdInputs().blockedTicketIds)

                setTicketIdInputs({
                    relatedTicketsIds: formatTicketIds(nextRelated),
                    blockingTicketIds: formatTicketIds(nextBlocking),
                    blockedTicketIds: formatTicketIds(nextBlocked),
                })

                props.onSubmit?.({
                    ...props.ticket,
                    relatedTicketsIds: nextRelated,
                    blockingTicketIds: nextBlocking,
                    blockedTicketIds: nextBlocked,
                })
            }}
        >
            <Stack spacing={1.5}>
                <TextField
                    name="id"
                    label={i18n?.t("ticketInfo.id")}
                    value={props.ticket.id != null ? String(props.ticket.id) : "-"}
                    disabled
                />
                <TextField
                    name="title"
                    label={i18n?.t("ticketInfo.title")}
                    value={props.ticket.title ?? ""}
                    onChange={(_, value) => setField("title", value)}
                    required
                    disabled={isReadOnly}
                />
                <TextField
                    name="description"
                    label={i18n?.t("ticketInfo.description")}
                    value={props.ticket.description ?? ""}
                    onChange={(_, value) => setField("description", value)}
                    rows={5}
                    multiline
                    disabled={isReadOnly}
                />
                <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1">{i18n?.t("ticketInfo.acceptanceCriteria")}</Typography>
                        <IconButton
                            onClick={() => setField("acceptanceCriteria", [...criteria(), { description: "", completed: false }])}
                            disabled={isReadOnly}
                            aria-label={i18n?.t("ticketInfo.addAcceptanceCriteria")}
                        >
                            <Add />
                        </IconButton>
                    </Stack>
                    <Index each={criteria()}>
                        {(criterion, index) => (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Checkbox
                                    checked={Boolean(criterion().completed)}
                                    onChange={(_, checked) =>
                                        setField(
                                            "acceptanceCriteria",
                                            criteria().map((entry, i) => (i === index ? { ...entry, completed: checked } : entry))
                                        )
                                    }
                                    disabled={isReadOnly}
                                />
                                <TextField
                                    fullWidth
                                    label={i18n?.t("ticketInfo.acceptanceCriteriaDescription")}
                                    placeholder={i18n?.t("ticketInfo.acceptanceCriteriaPlaceholder")}
                                    value={criterion().description ?? ""}
                                    onChange={(_, value) =>
                                        setField(
                                            "acceptanceCriteria",
                                            criteria().map((entry, i) => (i === index ? { ...entry, description: value } : entry))
                                        )
                                    }
                                    disabled={isReadOnly}
                                />
                                <IconButton
                                    onClick={() => setField("acceptanceCriteria", criteria().filter((_, i) => i !== index))}
                                    disabled={isReadOnly}
                                    aria-label={i18n?.t("ticketInfo.removeAcceptanceCriteria")}
                                >
                                    <Delete />
                                </IconButton>
                            </Stack>
                        )}
                    </Index>
                </Stack>
                <TextField
                    name="relatedTickets"
                    label={i18n?.t("ticketInfo.relatedTickets")}
                    placeholder={i18n?.t("ticketInfo.idsPlaceholder")}
                    value={ticketIdInputs().relatedTicketsIds}
                    onChange={(_, value) => setTicketIdInputs((prev) => ({ ...prev, relatedTicketsIds: value }))}
                    onBlur={() => commitTicketIds("relatedTicketsIds")}
                    disabled={isReadOnly}
                />
                <TextField
                    name="blockingTickets"
                    label={i18n?.t("ticketInfo.blockingTickets")}
                    placeholder={i18n?.t("ticketInfo.idsPlaceholder")}
                    value={ticketIdInputs().blockingTicketIds}
                    onChange={(_, value) => setTicketIdInputs((prev) => ({ ...prev, blockingTicketIds: value }))}
                    onBlur={() => commitTicketIds("blockingTicketIds")}
                    disabled={isReadOnly}
                />
                <TextField
                    name="blockedTickets"
                    label={i18n?.t("ticketInfo.blockedTickets")}
                    placeholder={i18n?.t("ticketInfo.idsPlaceholder")}
                    value={ticketIdInputs().blockedTicketIds}
                    onChange={(_, value) => setTicketIdInputs((prev) => ({ ...prev, blockedTicketIds: value }))}
                    onBlur={() => commitTicketIds("blockedTicketIds")}
                    disabled={isReadOnly}
                />
                <SearchUser
                    selected={props.ticket.assignee ?? ""}
                    setSelected={(username) => setField("assignee", username)}
                    disabled={isReadOnly}
                    label={i18n?.t("ticketInfo.assignee")}
                />
                <LabelSelector
                    selected={() => props.ticket.labels ?? []}
                    setSelected={setLabels}
                    disabled={isReadOnly}
                />
                <FormControl fullWidth>
                    <InputLabel id={`${formId}-priority-label`}>{i18n?.t("ticketInfo.priority")}</InputLabel>
                    <Select
                        labelId={`${formId}-priority-label`}
                        value={props.ticket.priority ?? TicketPriority.MEDIUM}
                        label={i18n?.t("ticketInfo.priority")}
                        onChange={(event) => setField("priority", event.target.value as TicketPriority)}
                        disabled={isReadOnly}
                    >
                        <For each={Object.values(TicketPriority)}>
                            {(priority) => (
                                <MenuItem value={priority}>{i18n?.t(`ticketPriority.${priority}`)}</MenuItem>
                            )}
                        </For>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id={`${formId}-size-label`}>{i18n?.t("ticketInfo.size")}</InputLabel>
                    <Select
                        labelId={`${formId}-size-label`}
                        value={props.ticket.size ?? TicketSize.MEDIUM}
                        label={i18n?.t("ticketInfo.size")}
                        onChange={(event) => setField("size", event.target.value as TicketSize)}
                        disabled={isReadOnly}
                    >
                        <For each={Object.values(TicketSize)}>
                            {(size) => (
                                <MenuItem value={size}>{i18n?.t(`ticketSize.${size}`)}</MenuItem>
                            )}
                        </For>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id={`${formId}-status-label`}>{i18n?.t("ticketInfo.status")}</InputLabel>
                    <Select
                        labelId={`${formId}-status-label`}
                        value={props.ticket.status ?? TicketStatus.OPEN}
                        label={i18n?.t("ticketInfo.status")}
                        onChange={(event) => setField("status", event.target.value as TicketStatus)}
                        disabled={isReadOnly}
                    >
                        <For each={Object.values(TicketStatus)}>
                            {(status) => (
                                <MenuItem value={status}>{i18n?.t(`ticketStatus.${status}`)}</MenuItem>
                            )}
                        </For>
                    </Select>
                </FormControl>
            </Stack>
        </form>
    )
}
