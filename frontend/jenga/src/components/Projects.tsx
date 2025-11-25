import { Button, Card, CardActions, CardContent, CardHeader, List, ListItem, ListItemButton, ListItemSecondaryAction, ListItemText, Stack } from "@suid/material"
import { ProjectContext } from "../provider/ProjectProvider"
import { Show, createMemo, createSignal, For, useContext } from "solid-js"
import { Delete } from "@suid/icons-material"
import { NewProjectDialog } from "./NewProjectDialog"
import { ProjectResourceService } from "../api"
import { ProjectInfo } from "./ProjectInfo"
import { AuthContext } from "../provider/AuthProvider"
import { InfoMode } from "../utils/utils"


export const Projects = () => {

    const pCtx = useContext(ProjectContext)
    const aCtx = useContext(AuthContext)

    const [open, setOpen] = createSignal(false)

    const projectCtx = useContext(ProjectContext)
    const formId = "selected-project-form"

    const projects = createMemo(() => {
        if (projectCtx?.projects.error) return

        return (projectCtx?.projects())
    })

    return (
        <>
            <Stack direction={"column"}>
                <Card sx={{ "height": "100%" }}>
                    <CardHeader title="Projects" />
                    <CardContent sx={{ "height": "80%" }}>
                        <List sx={{ "flex": "1", "height": "100", "maxHeight": "100%", "overflow": "auto" }}>
                            <For
                                each={projects()}
                                fallback={<div>No projects found</div>
                                }
                            >
                                {
                                    (p) => {
                                        return (
                                            <ListItem>
                                                <ListItemButton onClick={() => { pCtx?.setSelectedProject(p) }} selected={p === pCtx?.selectedProject()}>
                                                    <ListItemText
                                                        primary={p.name}
                                                        secondary={((p.createDate ?? "") + " | " + (p.modifyDate ?? ""))}
                                                    />
                                                </ListItemButton>
                                                <ListItemSecondaryAction>
                                                    <ListItemButton onClick={() => { if (p.identifier) pCtx?.deleteProject(p.identifier) }}>
                                                        <Delete></Delete>
                                                    </ListItemButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        )
                                    }
                                }
                            </For>
                        </List>
                    </CardContent>
                    <CardActions>
                        <Button onClick={() => { setOpen(true) }} disabled={!aCtx?.isLoggedIn()}>
                            NEW
                        </Button>
                    </CardActions>
                </Card >
                <Show when={pCtx?.selectedProject()}>
                    {(project) => (
                        <Card>
                            <CardHeader title="ProjectInfo" />
                            <CardContent>
                                    <ProjectInfo
                                        mode={InfoMode.Edit}
                                        formId={formId}
                                        project={project()}
                                        onProjectChange={(next) => pCtx?.setSelectedProject(() => next)}
                                        onSubmit={async (next) => {
                                            if (!next.identifier) return
                                            try {
                                                await ProjectResourceService.putApiProjects(next.identifier, next)
                                                pCtx?.setProjects((prev) =>
                                                    prev?.map((existing) =>
                                                        existing.identifier === next.identifier ? { ...existing, ...next } : existing
                                                    )
                                                )
                                                pCtx?.setSelectedProject(() => ({ ...next }))
                                            } catch (error) {
                                                console.error("Failed to update project", error)
                                            }
                                        }}
                                    />
                                    <Button type="submit" form={formId}>
                                        save
                                    </Button>
                            </CardContent>
                        </Card>
                    )}
                </Show>
            </Stack>
            <NewProjectDialog open={open()} setOpen={setOpen}></NewProjectDialog>
        </>
    )
}
