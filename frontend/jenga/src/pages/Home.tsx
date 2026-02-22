import { Card, CardContent, CardHeader, Stack } from "@suid/material"
import { Projects } from "../components/Projects"
import { Filedrop } from "../components/Filedrop";
import { useContext } from "solid-js";
import { I18nContext } from "../provider/I18nProvider";

export const Home = () => {
    const i18n = useContext(I18nContext);

    return (
        <Card>
            <CardHeader title={i18n?.t("pages.home.title")}></CardHeader>
            <CardContent>
                <Stack spacing={2}>
                    <div id="guide-projects">
                        <Projects></Projects>
                    </div>
                    <div id="guide-file-import">
                        <Filedrop></Filedrop>
                    </div>
                </Stack>
            </CardContent>
        </Card>
    )
}
