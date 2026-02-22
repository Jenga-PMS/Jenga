import { Alert, Box, Button } from "@suid/material"
import { createSignal, Show, useContext } from "solid-js"
import { GitHubIssueDTO, ImportResourceService } from "../api"
import { ProjectContext } from "../provider/ProjectProvider"
import { I18nContext } from "../provider/I18nProvider"

export const Filedrop = () => {

    const pCtx = useContext(ProjectContext)
    const i18n = useContext(I18nContext)
    const [uploadError, setUploadError] = createSignal<string>("");

    const handleFilesUpload = async (files: File[]) => {
        const projectId = pCtx?.selectedProject()?.identifier
        if (!projectId) {
            console.error("No project selected for import");
            setUploadError(i18n?.t("errors.noProjectSelectedForImport") ?? "")
            return
        }

        if (files.length === 0) return

        try {
            for (const f of files) {
                const text = await f.text()
                const obj: GitHubIssueDTO[] = JSON.parse(text)
                await ImportResourceService.postApiImportGithub(projectId, obj)
            }
            pCtx?.refetchTickets?.()
        } catch (error) {
            console.error("Failed to import issues", error)
            setUploadError(i18n?.t("errors.failedImportIssues") ?? "");
        }
    }

    return (
        <>
            <Box
                sx={{ "height": "20vh", "width": "100%", "border": "1px black dashed", "display": "flex" }}
                justifyContent="center"
                alignItems="center"
                onDragOver={e => { e.preventDefault() }}
                onDrop={async e => {
                    e.preventDefault()
                    if (!e.dataTransfer?.files || e.dataTransfer.files.length === 0) return
                    const droppedFiles = Array.from(e.dataTransfer.files)
                    await handleFilesUpload(droppedFiles)
                }}
            >
                <Button component="label" sx={{ "height": "5vh" }} variant="outlined">
                    <input
                        type="file"
                        multiple
                        hidden
                        onChange={async e => {
                            if (!e.currentTarget.files || e.currentTarget.files.length === 0) return
                            await handleFilesUpload(Array.from(e.currentTarget.files))
                            e.currentTarget.value = ""
                        }}
                    />
                    {i18n?.t("filedrop.chooseFile")}
                </Button>
            </Box>
            <Show when={uploadError()}>
                {
                    (message) => <Alert severity="error">{message()}</Alert>
                }
            </Show>
        </>
    )
}
