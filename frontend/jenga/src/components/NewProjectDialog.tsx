import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@suid/material"
import { Setter, useContext, createSignal, createEffect } from "solid-js"
import { ProjectRequestDTO, ProjectResponseDTO, ProjectResourceService } from "../api"
import { ProjectContext } from "../provider/ProjectProvider"
import { ProjectInfo } from "./ProjectInfo"
import { InfoMode } from "../utils/utils"

interface NewProjectDialogProps {
    open: boolean
    setOpen: Setter<boolean>
}

export const NewProjectDialog = (props: NewProjectDialogProps) => {

    const pCtx = useContext(ProjectContext)

    const EMPTY_PROJECT: ProjectResponseDTO = { identifier: "", name: "", description: "" }
    const formId = "new-project-form"
    const [project, setProject] = createSignal<ProjectResponseDTO>({ ...EMPTY_PROJECT })

    createEffect(() => {
        if (props.open) setProject(() => ({ ...EMPTY_PROJECT }))
    })

    const onCreate = async (draft?: ProjectResponseDTO) => {
        const source = draft ?? project()
        const request: ProjectRequestDTO = {
            identifier: source.identifier ?? "",
            name: source.name ?? "",
            description: source.description ?? ""
        }
        const newProject = await ProjectResourceService.postApiProjects(request)
        pCtx?.setProjects(prev => [...(prev ?? []), { ...newProject }])
        props.setOpen(false)
    }

    return (
        <Dialog open={props.open} fullWidth>
            <DialogTitle>New Project</DialogTitle>
            <DialogContent>
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
                    cancel
                </Button>
                <Button type="submit" form={formId}>
                    create
                </Button>
            </DialogActions>
        </Dialog>
    )
}
