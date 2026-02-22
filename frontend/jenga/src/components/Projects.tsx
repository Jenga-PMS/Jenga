import { Alert, Box, Button, Card, CardActions, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemButton, ListItemSecondaryAction, ListItemText, Stack, Typography } from "@suid/material"
import { ProjectContext } from "../provider/ProjectProvider"
import { Show, createMemo, createSignal, For, useContext, Setter } from "solid-js"
import { CheckCircle, Delete } from "@suid/icons-material"
import { NewProjectDialog } from "./NewProjectDialog"
import { ProjectResourceService } from "../api"
import { ProjectInfo } from "./ProjectInfo"
import { AuthContext } from "../provider/AuthProvider"
import { InfoMode } from "../utils/utils"
import { I18nContext } from "../provider/I18nProvider"
import "./Projects.css"

interface ConfirmDialogProps {
    setOpen: Setter<boolean>
    open: boolean
}

const ConfirmDialog = (props: ConfirmDialogProps) => {
    const pCtx = useContext(ProjectContext)
    const i18n = useContext(I18nContext)
    const [deleteError, setDeleteError] = createSignal("")

    const onCancel = () => {
        setDeleteError("")
        props.setOpen(false)
    }

    const onConfirm = async () => {
        setDeleteError("")
        const id = pCtx?.selectedProject()?.identifier
        if (!id) return
        if (!pCtx?.deleteProject) return

        try {
            await pCtx.deleteProject(id)
            props.setOpen(false)
        } catch (error) {
            console.error("Failed to delete project", error)
            setDeleteError(i18n?.t("errors.failedDeleteProject") ?? "")
        }
    }

    return (
        <Dialog
            open={props.open}
        >
            <DialogTitle>{i18n?.t("projects.confirmDeletionTitle")}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Stack>
                        {i18n?.t("projects.confirmDeletionText")}
                    </Stack>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>{i18n?.t("common.cancel")}</Button>
                <Button onClick={onConfirm} color="warning">{i18n?.t("common.confirm")}</Button>
            </DialogActions>
            <Show when={deleteError()}>
                {(message) => <Alert severity="error">{message()}</Alert>}
            </Show>
        </Dialog>
    )
}


export const Projects = () => {

    const pCtx = useContext(ProjectContext)
    const aCtx = useContext(AuthContext)
    const i18n = useContext(I18nContext)

    const [open, setOpen] = createSignal(false)
    const [openConfirm, setOpenConfirm] = createSignal(false)
    const [saveError, setSaveError] = createSignal("")
    const [saveSuccess, setSaveSuccess] = createSignal(false)

    const projectCtx = useContext(ProjectContext)
    const formId = "selected-project-form"

    const projects = createMemo(() => {
        if (projectCtx?.projects.error) return

        return (projectCtx?.projects())
    })

    return (
        <>
            <Box class="projects-layout">
                <Card class="projects-card">
                    <CardHeader title={i18n?.t("projects.title")} />
                    <CardContent class="projects-list-content">
                        <List>
                            <For
                                each={projects()}
                                fallback={<div>{i18n?.t("projects.noProjectsFound")}</div>
                                }
                            >
                                {
                                    (p) => {
                                        return (
                                            <ListItem>
                                                <ListItemButton
                                                    onClick={() => { pCtx?.setSelectedProject(p) }}
                                                    selected={p.identifier === pCtx?.selectedProject()?.identifier}
                                                >
                                                    <ListItemText
                                                        primary={p.name}
                                                        secondary={((p.createDate ?? "") + " | " + (p.modifyDate ?? ""))}
                                                    />
                                                </ListItemButton>
                                                <ListItemSecondaryAction>
                                                    <ListItemButton onClick={() => {
                                                        pCtx?.setSelectedProject(p);
                                                        setOpenConfirm(true);
                                                    }}>
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
                            {i18n?.t("common.new")}
                        </Button>
                    </CardActions>
                </Card >
                <Card variant="outlined" class="project-sidebar">
                    <CardHeader title={i18n?.t("projects.projectInfo")} />
                    <CardContent>
                        <Show
                            when={pCtx?.selectedProject()}
                            fallback={<Typography>{i18n?.t("projects.selectProject")}</Typography>}
                        >
                            {(project) => (
                                <>
                                    <ProjectInfo
                                        mode={InfoMode.Edit}
                                        formId={formId}
                                        project={project()}
                                        onProjectChange={(next) => {
                                            setSaveError("")
                                            setSaveSuccess(false)
                                            pCtx?.setSelectedProject(() => next)
                                        }}
                                        onSubmit={async (next) => {
                                            setSaveError("")
                                            setSaveSuccess(false)
                                            if (!next.identifier) return
                                            try {
                                                await ProjectResourceService.putApiProjects(next.identifier, next)
                                                pCtx?.setProjects((prev) =>
                                                    prev?.map((existing) =>
                                                        existing.identifier === next.identifier ? { ...existing, ...next } : existing
                                                    )
                                                )
                                                pCtx?.setSelectedProject(() => ({ ...next }))
                                                setSaveSuccess(true)
                                            } catch (error) {
                                                console.error("Failed to update project", error)
                                                setSaveError(i18n?.t("errors.failedUpdateProject") ?? "")
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
                                            {i18n?.t("projects.projectSaved")}
                                        </Alert>
                                    </Show>
                                </>
                            )}
                        </Show>
                    </CardContent>
                </Card>
            </Box>
            <NewProjectDialog open={open()} setOpen={setOpen}></NewProjectDialog>
            <ConfirmDialog open={openConfirm()} setOpen={setOpenConfirm}></ConfirmDialog>
        </>
    )
}
