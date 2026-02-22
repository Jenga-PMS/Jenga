import { Stack, TextField } from "@suid/material"
import { Setter, useContext } from "solid-js"
import { ProjectResponseDTO } from "../api"
import { InfoMode } from "../utils/utils"
import { I18nContext } from "../provider/I18nProvider"

interface ProjectInfoProps {
    mode: InfoMode
    project: ProjectResponseDTO
    onProjectChange: Setter<ProjectResponseDTO>
    onSubmit?: (project: ProjectResponseDTO) => void
    formId?: string
}

export const ProjectInfo = (props: ProjectInfoProps) => {
    const formId = props.formId ?? "project-info-form"
    const i18n = useContext(I18nContext)

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
                    label={i18n?.t("projectInfo.identifier")}
                    value={props.project.identifier ?? ""}
                    onChange={(_, value) => updateProject("identifier", value)}
                    disabled={props.mode === InfoMode.Edit || props.mode === InfoMode.ReadOnly}
                    required
                />
                <TextField
                    name="name"
                    label={i18n?.t("projectInfo.name")}
                    value={props.project.name ?? ""}
                    onChange={(_, value) => updateProject("name", value)}
                    disabled={props.mode === InfoMode.ReadOnly}
                    required
                />
                <TextField
                    name="description"
                    label={i18n?.t("projectInfo.description")}
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
