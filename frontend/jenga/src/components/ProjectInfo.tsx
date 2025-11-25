import { Stack, TextField } from "@suid/material"
import { Setter } from "solid-js"
import { ProjectResponseDTO } from "../api"
import { InfoMode } from "../utils/utils"

interface ProjectInfoProps {
    mode: InfoMode
    project: ProjectResponseDTO
    onProjectChange: Setter<ProjectResponseDTO>
    onSubmit?: (project: ProjectResponseDTO) => void
    formId?: string
}

export const ProjectInfo = (props: ProjectInfoProps) => {
    const formId = props.formId ?? "project-info-form"

    const updateProject = (key: keyof ProjectResponseDTO, value: string) => {
        const updatedProject = { ...props.project, [key]: value }
        props.onProjectChange(updatedProject)
    }

    return (
        <form
            id={formId}
            onSubmit={(event) => {
                event.preventDefault()
                props.onSubmit?.({ ...props.project })
            }}
        >
            <Stack spacing={1}>
                <TextField
                    name="id"
                    label="identifier"
                    value={props.project.identifier ?? ""}
                    onChange={(_, value) => updateProject("identifier", value)}
                    disabled={props.mode === InfoMode.Edit || props.mode === InfoMode.ReadOnly}
                    required
                />
                <TextField
                    name="name"
                    label="name"
                    value={props.project.name ?? ""}
                    onChange={(_, value) => updateProject("name", value)}
                    disabled={props.mode === InfoMode.ReadOnly}
                    required
                />
                <TextField
                    name="description"
                    label="description"
                    value={props.project.description ?? ""}
                    onChange={(_, value) => updateProject("description", value)}
                    disabled={props.mode === InfoMode.ReadOnly}
                    rows={5}
                    multiline
                />
            </Stack>
        </form>
    )
}
