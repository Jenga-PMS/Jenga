import { Alert, Box, Button, Card, CardContent, CardHeader, Stack, Typography } from "@suid/material"
import { CheckCircle } from "@suid/icons-material"
import { Backlog } from "../components/Backlog"
import { Kanban } from "../components/Kanban"
import { Show, createMemo, createSignal, useContext } from "solid-js"
import { ProjectContext } from "../provider/ProjectProvider"
import { TicketInfo } from "../components/TicketInfo"
import { TicketFilter, TicketFilters, matchesTicketFilters } from "../components/TicketFilters"
import { InfoMode } from "../utils/utils"
import { I18nContext } from "../provider/I18nProvider"
import "./Sprint.css"

export const Sprint = () => {

    const pCtx = useContext(ProjectContext)
    const i18n = useContext(I18nContext)
    const formId = "selected-ticket-form"
    const [saveError, setSaveError] = createSignal("")
    const [saveSuccess, setSaveSuccess] = createSignal(false)
    const [ticketFilters, setTicketFilters] = createSignal<TicketFilter[]>([])

    const filteredTickets = createMemo(() =>
        (pCtx?.tickets() ?? []).filter((ticket) => matchesTicketFilters(ticket, ticketFilters()))
    )

    return (
        <Card>
            <CardHeader title={i18n?.t("pages.sprint.title")}></CardHeader>
            <CardContent>
                <Box class="sprint-layout">
                    <Stack spacing={2}>
                        <TicketFilters
                            onFiltersChange={setTicketFilters}
                        />
                        <Kanban tickets={filteredTickets()}></Kanban>
                        <Backlog tickets={filteredTickets()}></Backlog>
                    </Stack>

                    <Card id="guide-ticket-details" variant="outlined" class="ticket-sidebar">
                        <CardHeader title={i18n?.t("pages.sprint.ticketDetails")} />
                        <CardContent>
                            <Show
                                when={pCtx?.selectedTicket()}
                                fallback={
                                    <Typography>
                                        {i18n?.t("pages.sprint.selectTicket")}
                                    </Typography>
                                }
                            >
                                {(ticket) => (
                                    <Stack spacing={1.5}>
                                        <TicketInfo
                                            mode={InfoMode.Edit}
                                            formId={formId}
                                            ticket={ticket()}
                                            onTicketChange={(next) => {
                                                setSaveSuccess(false)
                                                setSaveError("")
                                                pCtx?.setSelectedTicket(() => next)
                                            }}
                                            onSubmit={async (next) => {
                                                setSaveError("")
                                                setSaveSuccess(false)
                                                const projectId = pCtx?.selectedProject()?.identifier
                                                if (!projectId) {
                                                    setSaveError(i18n?.t("errors.noProjectSelected") ?? "")
                                                    return
                                                }

                                                if (!pCtx?.updateTicket) return

                                                try {
                                                    await pCtx.updateTicket(projectId, next)
                                                    setSaveSuccess(true)
                                                } catch (error) {
                                                    console.error("Failed to save ticket", error)
                                                    setSaveError(i18n?.t("errors.failedSaveTicket") ?? "")
                                                }
                                            }}
                                        />
                                        <Button type="submit" form={formId}>
                                            {i18n?.t("common.save")}
                                        </Button>
                                        <Show when={saveError()}>
                                            {(message) => <Alert severity="error">{message()}</Alert>}
                                        </Show>
                                        <Show when={saveSuccess()}>
                                            <Alert severity="success" icon={<CheckCircle />}>
                                                {i18n?.t("pages.sprint.ticketSaved")}
                                            </Alert>
                                        </Show>
                                    </Stack>
                                )}
                            </Show>
                        </CardContent>
                    </Card>
                </Box>
            </CardContent>
        </Card>
    )
}
