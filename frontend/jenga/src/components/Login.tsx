import { Alert, AlertTitle, Button, Stack, TextField } from "@suid/material";
import { Show, createSignal, useContext } from "solid-js";
import { LoginRequestDTO } from "../api";
import { AuthContext } from "../provider/AuthProvider";
import { I18nContext } from "../provider/I18nProvider";

export const LogIn = () => {

    const aCtx = useContext(AuthContext);
    const i18n = useContext(I18nContext);

    const [username, setUsername] = createSignal("")
    const [password, setPassword] = createSignal("")

    const onClick = () => {
        const request: LoginRequestDTO = {
            username: username(),
            password: password()
        }

        aCtx?.login?.(request)
    }

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault()
                onClick()
            }}
        >
            <Stack spacing={1}>
                <TextField label={i18n?.t("auth.username")} value={username()} onChange={(e) => setUsername(e.currentTarget.value)} required></TextField>
                <TextField label={i18n?.t("auth.password")} value={password()} onChange={(e) => setPassword(e.currentTarget.value)} type="password" required></TextField>
                <Show when={aCtx?.jwt.error}>
                    <Alert severity="error">
                        <AlertTitle>{i18n?.t("auth.wrongCredentials")}</AlertTitle>
                    </Alert>
                </Show>
                <Button type="submit">
                    {i18n?.t("auth.login")}
                </Button>
            </Stack>
        </form>
    )
}
