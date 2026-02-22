import { Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@suid/material"
import { CheckCircle } from "@suid/icons-material"
import { Setter, useContext, createSignal, createEffect, Show } from "solid-js"
import { ProjectRequestDTO, ProjectResponseDTO, ProjectResourceService } from "../api"
import { ProjectContext } from "../provider/ProjectProvider"
import { ProjectInfo } from "./ProjectInfo"
import { InfoMode } from "../utils/utils"
import { I18nContext } from "../provider/I18nProvider"

interface NewProjectDialogProps {
    open: boolean
    setOpen: Setter<boolean>
}

export const NewProjectDialog = (props: NewProjectDialogProps) => {

    const pCtx = useContext(ProjectContext)
    const i18n = useContext(I18nContext)

    const EMPTY_PROJECT: ProjectResponseDTO = { identifier: "", name: "", description: "" }
    const formId = "new-project-form"
    const [project, setProject] = createSignal<ProjectResponseDTO>({ ...EMPTY_PROJECT })
    const [createError, setCreateError] = createSignal("")
    const [createSuccess, setCreateSuccess] = createSignal(false)

    createEffect(() => {
        if (props.open) {
            setProject(() => ({ ...EMPTY_PROJECT }))
            setCreateError("")
            setCreateSuccess(false)
        }
    })

    const onCreate = async (draft?: ProjectResponseDTO) => {
        const source = draft ?? project()
        const request: ProjectRequestDTO = {
            identifier: source.identifier ?? "",
            name: source.name ?? "",
            description: source.description ?? ""
        }
        setCreateError("")
        setCreateSuccess(false)

        try {
            const newProject = await ProjectResourceService.postApiProjects(request)
            pCtx?.setProjects(prev => [...(prev ?? []), { ...newProject }])
            setCreateSuccess(true)
            setTimeout(() => props.setOpen(false), 700)
        } catch (error) {
            console.error("Failed to create project", error)
            setCreateError(i18n?.t("errors.failedCreateProject") ?? "")
        }
    }

    return (
        <Dialog open={props.open} fullWidth>
            <DialogTitle>{i18n?.t("newProject.title")}</DialogTitle>
            <DialogContent>
                <Show when={createError()}>
                    {(message) => <Alert severity="error">{message()}</Alert>}
                </Show>
                <Show when={createSuccess()}>
                    <Alert severity="success" icon={<CheckCircle />}>
                        {i18n?.t("newProject.created")}
                    </Alert>
                </Show>
                <ProjectInfo
                    mode={InfoMode.Create}
                    formId={formId}
                    project={project()}
                    onProjectChange={setProject}
                    onSubmit={onCreate}
                />
            </DialogContent>
            <DialogActions>
                <Button type="button" onClick={() => { props.setOpen(false) }}>
                    {i18n?.t("common.cancel")}
                </Button>
                <Button type="submit" form={formId}>
                    {i18n?.t("common.create")}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
