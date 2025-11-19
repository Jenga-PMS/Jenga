import { Button, Card, CardContent, CardHeader, Stack, TextField } from "@suid/material"
import { createEffect, createResource, createSignal, useContext } from "solid-js"
import { ProjectContext } from "../provider/ProjectProvider"
import { AiResourceService } from "../api"

export const Chat = () => {
    const pCtx = useContext(ProjectContext)

    const [message, setMessage] = createSignal("")
    const [n, setN] = createSignal(0)

    const [response] = createResource(n, async q => await AiResourceService.postApiAiChat({ message: message() }))
    return (
        <Card>
            <CardHeader title={"chat " + n()}></CardHeader>
            <CardContent>
                <Stack spacing={2}>
                    id: {pCtx?.selectedProject()?.identifier}
                    <TextField onChange={e => setMessage(e.currentTarget.value)} value={message()}></TextField>
                </Stack>
                <Button onClick={()=>setN(prev=>prev + 1)}>submit</Button>
            </CardContent>
        </Card>
    )
}