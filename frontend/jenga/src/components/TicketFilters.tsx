import { FormControl, IconButton, InputLabel, List, ListItem, ListItemButton, MenuItem, Select, Stack, TextField, Typography } from "@suid/material"
import { Index, Show, createEffect, createSignal, useContext } from "solid-js"
import { TicketResponseDTO } from "../api"
import { Delete } from "@suid/icons-material"
import { I18nContext } from "../provider/I18nProvider"

export type TicketFilterField =
    | "all"
    | "title"
    | "description"
    | "assignee"
    | "reporter"
    | "status"
    | "labels"
    | "blocked"
    | "related"

export type TicketFilter = {
    field: TicketFilterField
    value: string
}

interface TicketFiltersProps {
    onFiltersChange: (filters: TicketFilter[]) => void
}

interface TicketFilterRowProps {
    index: number
    filter: TicketFilter
    onFieldChange: (index: number, field: TicketFilterField) => void
    onValueChange: (index: number, value: string) => void
    onRemove: (index: number) => void
    canRemove: boolean
}

const includesFilter = (value: string | undefined, query: string) =>
    value?.toLowerCase().includes(query) ?? false

const includesLabelFilter = (labels: string[] | undefined, query: string) =>
    labels?.some((label) => label.toLowerCase().includes(query)) ?? false

const includesIdFilter = (ids: number[] | undefined, query: string) =>
    ids?.some((id) => String(id).includes(query)) ?? false

export const matchesTicketFilters = (ticket: TicketResponseDTO, filters: TicketFilter[]) => {
    const activeFilters = filters.filter((filter) => filter.value.trim())
    if (activeFilters.length === 0) return true

    return activeFilters.every((filter) => {
        const query = filter.value.trim().toLowerCase()

        switch (filter.field) {
            case "title":
                return includesFilter(ticket.title, query)
            case "description":
                return includesFilter(ticket.description, query)
            case "assignee":
                return includesFilter(ticket.assignee, query)
            case "reporter":
                return includesFilter(ticket.reporter, query)
            case "status":
                return includesFilter(ticket.status, query)
            case "labels":
                return includesLabelFilter(ticket.labels, query)
            case "blocked":
                return includesIdFilter(ticket.blockingTicketIds, query)
                    || includesIdFilter(ticket.blockedTicketIds, query)
            case "related":
                return includesIdFilter(ticket.relatedTicketsIds, query)
            case "all":
            default:
                return (
                    includesFilter(ticket.title, query)
                    || includesFilter(ticket.description, query)
                    || includesFilter(ticket.assignee, query)
                    || includesFilter(ticket.reporter, query)
                    || includesFilter(ticket.status, query)
                    || includesLabelFilter(ticket.labels, query)
                    || includesIdFilter(ticket.blockingTicketIds, query)
                    || includesIdFilter(ticket.blockedTicketIds, query)
                    || includesIdFilter(ticket.relatedTicketsIds, query)
                )
        }
    })
}

const TicketFilterRow = (props: TicketFilterRowProps) => {
    const i18n = useContext(I18nContext)

    return (
        <ListItem sx={{ px: 0 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: "100%" }}>
                <FormControl sx={{ "minWidth": "12rem" }}>
                    <InputLabel id={`ticket-filter-by-label-${props.index}`}>{i18n?.t("ticketFilters.filterBy")}</InputLabel>
                    <Select
                        labelId={`ticket-filter-by-label-${props.index}`}
                        value={props.filter.field}
                        label={i18n?.t("ticketFilters.filterBy")}
                        onChange={(event) => props.onFieldChange(props.index, event.target.value as TicketFilterField)}
                    >
                        <MenuItem value="all">{i18n?.t("ticketFilters.field.all")}</MenuItem>
                        <MenuItem value="title">{i18n?.t("ticketFilters.field.title")}</MenuItem>
                        <MenuItem value="description">{i18n?.t("ticketFilters.field.description")}</MenuItem>
                        <MenuItem value="assignee">{i18n?.t("ticketFilters.field.assignee")}</MenuItem>
                        <MenuItem value="reporter">{i18n?.t("ticketFilters.field.reporter")}</MenuItem>
                        <MenuItem value="status">{i18n?.t("ticketFilters.field.status")}</MenuItem>
                        <MenuItem value="labels">{i18n?.t("ticketFilters.field.labels")}</MenuItem>
                        <MenuItem value="blocked">{i18n?.t("ticketFilters.field.blocked")}</MenuItem>
                        <MenuItem value="related">{i18n?.t("ticketFilters.field.related")}</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    label={i18n?.t("ticketFilters.ticketFilter")}
                    placeholder={i18n?.t("ticketFilters.placeholder")}
                    value={props.filter.value}
                    onChange={(_, value) => props.onValueChange(props.index, value)}
                />
                <IconButton
                    aria-label={i18n?.t("ticketFilters.removeFilterRow")}
                    onClick={() => props.onRemove(props.index)}
                    disabled={!props.canRemove}
                    sx={{
                        "&:hover": { color: "red" },
                    }}
                >
                    <Delete></Delete>
                </IconButton>
            </Stack>
        </ListItem>
    )
}

export const TicketFilters = (props: TicketFiltersProps) => {
    const i18n = useContext(I18nContext)
    const [filters, setFilters] = createSignal<TicketFilter[]>([{ field: "all", value: "" }])
    const [expanded, setExpanded] = createSignal(true)

    const emptyFilter: TicketFilter = { field: "all", value: "" }
    const isEmpty = (filter: TicketFilter) => !filter.value.trim()

    const normalize = (rows: TicketFilter[], keepTrailingEmpty: boolean) => {
        if (rows.length === 0) return [{ ...emptyFilter }]

        const next = [...rows]
        while (next.length > 1 && isEmpty(next[next.length - 1]) && isEmpty(next[next.length - 2])) {
            next.pop()
        }

        if (keepTrailingEmpty && !isEmpty(next[next.length - 1])) {
            next.push({ ...emptyFilter })
        }

        if (!next.some(isEmpty)) {
            next.push({ ...emptyFilter })
        }

        return next
    }

    const updateFilterField = (index: number, field: TicketFilterField) => {
        setFilters((prev) => normalize(prev.map((filter, i) => (i === index ? { ...filter, field } : filter)), true))
    }

    const updateFilterValue = (index: number, value: string) => {
        setFilters((prev) => normalize(prev.map((filter, i) => (i === index ? { ...filter, value } : filter)), true))
    }

    const removeFilterRow = (index: number) => {
        setFilters((prev) => normalize(prev.length > 1 ? prev.filter((_, i) => i !== index) : prev, false))
    }

    createEffect(() => {
        props.onFiltersChange(filters())
    })

    return (
        <Stack
            id="guide-ticket-filter"
            spacing={1.5}
            sx={{
                "border": "1px solid",
                "borderColor": "divider",
                "borderRadius": 1.5,
                "p": 1.5,
            }}
        >
            <List sx={{ p: 0 }}>
                <TicketFilterRow
                    index={0}
                    filter={filters()[0]}
                    onFieldChange={updateFilterField}
                    onValueChange={updateFilterValue}
                    onRemove={removeFilterRow}
                    canRemove={filters().length > 1}
                />
                <Show when={expanded()}>
                    <Index each={filters().slice(1)}>
                        {(filter, index) => (
                            <TicketFilterRow
                                index={index + 1}
                                filter={filter()}
                                onFieldChange={updateFilterField}
                                onValueChange={updateFilterValue}
                                onRemove={removeFilterRow}
                                canRemove={filters().length > 1}
                            />
                        )}
                    </Index>
                </Show>
                <Show when={filters().length > 1}>
                    <ListItem>
                        <ListItemButton
                            onClick={() => setExpanded((prev) => !prev)}
                            sx={{
                                width: "100%",
                                "borderRadius": 1,
                                "border": "1px solid",
                                "borderColor": "divider",
                                "justifyContent": "flex-start",
                            }}
                        >
                            <Typography>
                                {expanded() ? i18n?.t("ticketFilters.showLess") : i18n?.t("ticketFilters.extend")}
                            </Typography>
                        </ListItemButton>
                    </ListItem>
                </Show>
            </List>
        </Stack>
    )
}
