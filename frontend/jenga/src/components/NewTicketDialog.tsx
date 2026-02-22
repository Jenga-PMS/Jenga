import { Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@suid/material"
import { CheckCircle } from "@suid/icons-material"
import { Setter, useContext, createSignal, createEffect, Show } from "solid-js"
import { TicketPriority, TicketSize, TicketStatus, TicketRequestDTO, TicketResponseDTO, TicketResourceService } from "../api"
import { ProjectContext } from "../provider/ProjectProvider"
import { TicketInfo } from "./TicketInfo"
import { InfoMode } from "../utils/utils"
import { I18nContext } from "../provider/I18nProvider"

interface NewTicketDialogProps {
    open: boolean
    setOpen: Setter<boolean>
}

export const NewTicketDialog = (props: NewTicketDialogProps) => {
    const pCtx = useContext(ProjectContext)
    const i18n = useContext(I18nContext)

    const EMPTY_TICKET: TicketResponseDTO = {
        title: "",
        description: "",
        priority: TicketPriority.MEDIUM,
        size: TicketSize.MEDIUM,
        status: TicketStatus.OPEN,
        assignee: "",
        labels: [],
        acceptanceCriteria: [],
    }

    const formId = "new-ticket-form"
    const [ticket, setTicket] = createSignal<TicketResponseDTO>({ ...EMPTY_TICKET })
    const [createError, setCreateError] = createSignal("")
    const [createSuccess, setCreateSuccess] = createSignal(false)

    createEffect(() => {
        if (props.open) {
            setTicket(() => ({
                ...EMPTY_TICKET,
                projectName: pCtx?.selectedProject().name,
            }))
            setCreateError("")
            setCreateSuccess(false)
        }
    })

    const onCreate = async (draft?: TicketResponseDTO) => {
        const source = draft ?? ticket()
        const project = pCtx?.selectedProject()
        if (!project?.identifier) {
            setCreateError(i18n?.t("errors.noProjectSelected") ?? "")
            return
        }

        const request: TicketRequestDTO = {
            projectName: project.name,
            title: source.title ?? "",
            description: source.description ?? "",
            priority: source.priority ?? TicketPriority.MEDIUM,
            size: source.size ?? TicketSize.MEDIUM,
            status: source.status ?? TicketStatus.OPEN,
            assignee: source.assignee ?? "",
            labels: source.labels ?? [],
            acceptanceCriteria: (source.acceptanceCriteria ?? [])
                .map((criteria) => ({
                    description: (criteria.description ?? "").trim(),
                    completed: Boolean(criteria.completed),
                }))
                .filter((criteria) => criteria.description.length > 0),
            relatedTicketsIds: source.relatedTicketsIds ?? [],
            blockingTicketIds: source.blockingTicketIds ?? [],
            blockedTicketIds: source.blockedTicketIds ?? [],
        }

        setCreateError("")
        setCreateSuccess(false)

        try {
            const newTicket = await TicketResourceService.postApiTickets(project.identifier, request)
            pCtx?.setTickets(prev => [...prev ?? [], newTicket])
            setCreateSuccess(true)
            setTimeout(() => props.setOpen(false), 700)
        } catch (error) {
            console.error("Failed to create ticket", error)
            setCreateError(i18n?.t("errors.failedCreateTicket") ?? "")
        }
    }

    return (
        <Dialog open={props.open} fullWidth>
            <DialogTitle title={i18n?.t("newTicket.title")}>{i18n?.t("newTicket.title")}</DialogTitle>
            <DialogContent>
                <Show when={createError()}>
                    {(message) => <Alert severity="error">{message()}</Alert>}
                </Show>
                <Show when={createSuccess()}>
                    <Alert severity="success" icon={<CheckCircle />}>
                        {i18n?.t("newTicket.created")}
                    </Alert>
                </Show>
                <TicketInfo
                    mode={InfoMode.Create}
                    formId={formId}
                    ticket={ticket()}
                    onTicketChange={setTicket}
                    onSubmit={onCreate}
                />
            </DialogContent>
            <DialogActions>
                <Button type="button" onClick={() => { props.setOpen(false) }}>{i18n?.t("common.cancel")}</Button>
                <Button type="submit" form={formId}>{i18n?.t("common.create")}</Button>
            </DialogActions>
        </Dialog>
    )
}
