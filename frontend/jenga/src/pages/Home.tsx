import { Card, CardContent, CardHeader, Stack } from "@suid/material"
import { Projects } from "../components/Projects"
import { Filedrop } from "../components/Filedrop";

export const Home = () => {
    return (
        <Card>
            <CardHeader title="Home"></CardHeader>
            <CardContent>
                <Stack spacing={2}>
                    <Projects></Projects>
                    <Filedrop></Filedrop>
                </Stack>
            </CardContent>
        </Card>
    )
}