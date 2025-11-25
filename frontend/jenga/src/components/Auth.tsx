import { Avatar, Box, Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton, Popper, Stack, ToggleButton, ToggleButtonGroup } from "@suid/material";
import { Login, Logout } from "@suid/icons-material";
import { Match, Switch, createSignal, useContext } from "solid-js";
import { LogIn } from "./Login";
import { Register } from "./Register";
import { AuthContext } from "../provider/AuthProvider";
import { UserInfo } from "./UserInfo";
import { A } from "@solidjs/router";

const enum AuthE {
    SignIn,
    SignUp
}

const LoggedIn = () => {

    const aCtx = useContext(AuthContext);

    const [showProfile, setShowProfile] = createSignal(false)
    const [anchorEl, setAnchorEl] = createSignal<HTMLButtonElement>()

    const logout = () => {
        aCtx?.logout?.()
    }

    return (
        <Stack direction="row">
            <IconButton
                onMouseEnter={() => setShowProfile(true)}
                onMouseLeave={() => setShowProfile(false)}
                ref={(el) => setAnchorEl(el)}
                component={A}
                href="/Profile"
            >
                <Avatar></Avatar>
            </IconButton>
            <Popper
                anchorEl={anchorEl()}
                anchorOrigin={
                    {
                        vertical: 'bottom',
                        horizontal: 'center',
                    }
                }
                open={showProfile()}
            >
                <Card>
                    <CardContent>
                        <UserInfo user={aCtx?.jwt()}></UserInfo>
                    </CardContent>
                </Card>
            </Popper>
            <IconButton onClick={logout}>
                <Logout></Logout>
            </IconButton>
        </Stack>
    )
}

const LoggedOut = () => {
    const [open, setOpen] = createSignal(false)
    const [mode, setMode] = createSignal(AuthE.SignIn)

    return (
        <>

            <IconButton onClick={() => setOpen(true)} color="inherit">
                <Login></Login>
            </IconButton>
            <Dialog open={open()} fullWidth onClose={() => setOpen(false)}>
                <DialogTitle>Authentication</DialogTitle>
                <DialogContent>
                    <Stack spacing={2}>
                        <ToggleButtonGroup
                            value={mode()}
                            exclusive
                            fullWidth
                            onChange={(_, value) => value !== null && setMode(value)}
                        >
                            <ToggleButton value={AuthE.SignIn}>Sign In</ToggleButton>
                            <ToggleButton value={AuthE.SignUp}>Sign Up</ToggleButton>
                        </ToggleButtonGroup>

                        <Switch>
                            <Match when={mode() === AuthE.SignUp}>
                                <Register></Register>
                            </Match>
                            <Match when={mode() === AuthE.SignIn}>
                                <LogIn></LogIn>
                            </Match>
                        </Switch>
                    </Stack>
                </DialogContent>
            </Dialog >
        </>
    )
}

export const Auth = () => {

    const aCtx = useContext(AuthContext);

    return (
        <Switch>
            <Match when={aCtx?.isLoggedIn()}>
                <LoggedIn></LoggedIn>
            </Match>
            <Match when={!aCtx?.isLoggedIn()}>
                <LoggedOut></LoggedOut>
            </Match>
        </Switch>
    )
}
