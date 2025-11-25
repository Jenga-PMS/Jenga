import { Button, Card, CardContent, CardHeader, Stack } from "@suid/material"
import { Backlog } from "../components/Backlog"
import { Kanban } from "../components/Kanban"
import { Show, useContext } from "solid-js"
import { ProjectContext } from "../provider/ProjectProvider"
import { TicketInfo } from "../components/TicketInfo"
import { InfoMode } from "../utils/utils"


export const Sprint = () => {

    const pCtx = useContext(ProjectContext)
    const formId = "selected-ticket-form"

    return (
        <Card sx={{}}>
            <CardHeader title="Sprint"></CardHeader>
            <CardContent>
                <Stack spacing={2}>
                    <Kanban></Kanban>
                    <Backlog></Backlog>
                </Stack>
            </CardContent>
            <Show when={pCtx?.selectedTicket()}>
                {(ticket) => (
                    <>
                        <TicketInfo
                            mode={InfoMode.Edit}
                            formId={formId}
                            ticket={ticket()}
                            onTicketChange={(next) => pCtx?.setSelectedTicket(() => next)}
                            onSubmit={(next) => {
                                const projectId = pCtx?.selectedProject()?.identifier
                                if (projectId) {
                                    void pCtx?.updateTicket(projectId, next)
                                }
                            }}
                        />
                        <Button type="submit" form={formId}>
                            save
                        </Button>
                    </>
                )}
            </Show>
        </Card>
    )
}
