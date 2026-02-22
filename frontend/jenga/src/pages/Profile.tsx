import { Avatar, Card, CardContent, CardHeader } from "@suid/material"
import { Show, useContext } from "solid-js"
import { UserContext } from "../provider/UserProvider"
import { AuthContext } from "../provider/AuthProvider"
import { I18nContext } from "../provider/I18nProvider"

export const Profile = () => {
    const aCtx = useContext(AuthContext)
    const uCtx = useContext(UserContext)
    const i18n = useContext(I18nContext)

    return (
        <Card>
            <CardHeader title={i18n?.t("pages.profile.title")}></CardHeader>
            <CardContent>
                <Show when={aCtx?.isLoggedIn()} fallback={<div>{i18n?.t("pages.profile.loginRequired")}</div>}>
                    <Avatar></Avatar>
                    <div>{i18n?.t("pages.profile.username")}: {uCtx?.user()?.username}</div>
                    <div>{i18n?.t("pages.profile.email")}: {uCtx?.user()?.email}</div>
                </Show>
            </CardContent>
        </Card>
    )
}
