import { Card, CardContent, CardHeader } from "@suid/material"
import { useContext } from "solid-js"
import { I18nContext } from "../provider/I18nProvider"

export const About = () => {
    const i18n = useContext(I18nContext)

    return (
        <Card>
            <CardHeader title={i18n?.t("pages.about.title")}></CardHeader>
            <CardContent></CardContent>
        </Card>
    )
}
