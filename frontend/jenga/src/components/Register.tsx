import { Alert, AlertTitle, Button, Stack, TextField } from "@suid/material";
import { Show, createSignal, useContext } from "solid-js";
import { RegisterRequestDTO } from "../api";
import { AuthContext } from "../provider/AuthProvider";
import { I18nContext } from "../provider/I18nProvider";

export const Register = () => {
    const aCtx = useContext(AuthContext);
    const i18n = useContext(I18nContext);

    const [username, setUsername] = createSignal("")
    const [password, setPassword] = createSignal("")
    const [email, setEmail] = createSignal("")

    const onClick = () => {
        const request: RegisterRequestDTO = {
            username: username(),
            email: email(),
            password: password()
        }

        aCtx?.register?.(request)
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
                <TextField label={i18n?.t("auth.email")} value={email()} onChange={(e) => setEmail(e.currentTarget.value)} type="email" required></TextField>
                <TextField label={i18n?.t("auth.password")} value={password()} onChange={(e) => setPassword(e.currentTarget.value)} type="password" required></TextField>
                <Show when={aCtx?.registerResult.error}>
                    <Alert severity="error">
                        <AlertTitle>{i18n?.t("auth.registrationFailed")}</AlertTitle>
                    </Alert>
                </Show>
                <Button type="submit" disabled={aCtx?.registerResult.loading}>
                    {i18n?.t("auth.register")}
                </Button>
            </Stack>
        </form>
    )
}
