import { Box, Button } from "@suid/material"
import { createEffect, createSignal, useContext } from "solid-js"
import { GitHubIssueDTO, ImportResourceService } from "../api"
import { ProjectContext } from "../provider/ProjectProvider"

export const Filedrop = () => {

    const [files, setFiles] = createSignal<File[]>([])
    const pCtx = useContext(ProjectContext)

    createEffect(
        async () => {
            for (const f of files()) {
                const text = await f.text()
                const obj: GitHubIssueDTO[] = JSON.parse(text)
                await ImportResourceService.postApiImportGithub(pCtx?.selectedProject()?.identifier, obj)
            }
            if (files().length > 0) pCtx?.refetchTickets?.()
        }
    )

    return (
        <Box
            sx={{ "height": "20vh", "width": "100%", "border": "1px black dashed", "display": "flex" }}
            justifyContent="center"
            alignItems="center"
            onDragOver={e => { e.preventDefault() }}
            onDrop={async e => {
                e.preventDefault()
                if (!e.dataTransfer?.files || e.dataTransfer.files.length === 0) return
                const droppedFiles = Array.from(e.dataTransfer.files)
                setFiles(droppedFiles)
            }}
        >
            <Button component="label" sx={{ "height": "5vh" }} variant="outlined">
                <input
                    type="file"
                    multiple
                    hidden
                    onChange={e => {
                        if (!e.currentTarget.files || e.currentTarget.files.length === 0) return
                        setFiles(Array.from(e.currentTarget.files))
                    }}
                />
                Choose File
            </Button>
        </Box>
    )
}
