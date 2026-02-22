import { Box, List, ListItem, ListItemButton, ListItemText, Popper, TextField } from "@suid/material"
import { createEffect, createMemo, createResource, createSignal, For, useContext } from "solid-js"
import { UserResourceService } from "../api"
import { I18nContext } from "../provider/I18nProvider"

interface SearchUserProps {
    setSelected: (username: string) => void
    selected: string
    disabled?: boolean
    label?: string
}

export const SearchUser = (props: SearchUserProps) => {
    const i18n = useContext(I18nContext)
    let ref: HTMLDivElement | undefined

    const [input, setInput] = createSignal(props.selected)
    const [searchError, setSearchError] = createSignal("")
    const query = createMemo(() => input().trim() || undefined)
    const [options] = createResource(query, async (q) => {
        if (!q) {
            setSearchError("")
            return []
        }

        try {
            const users = await UserResourceService.getApiUsersSearch(q)
            setSearchError("")
            return users
        } catch (error) {
            console.error("Failed to load users", error)
            setSearchError(i18n?.t("errors.failedLoadUsers") ?? "")
            return []
        }
    })
    const [focused, setFocused] = createSignal(false)
    const suggestions = createMemo(() => options() ?? [])
    const open = createMemo(
        () => focused() && !props.disabled && !options.loading && !searchError() && suggestions().length > 0
    )

    createEffect(() => {
        setInput(props.selected)
    })

    const selectUser = (username: string) => {
        setInput(username)
        props.setSelected(username)
    }

    return (
        <>
            <div ref={el => ref = el}>
                <TextField
                    label={props.label}
                    value={input()}
                    onChange={(event) => {
                        selectUser(event.currentTarget.value)
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    disabled={props.disabled}
                    error={Boolean(searchError())}
                    helperText={searchError() || undefined}
                    fullWidth
                />
            </div>
            <Popper anchorEl={ref} open={open()} placement="bottom-start" style={{ "z-index": 1600 }}>
                <Box backgroundColor="white">
                    <List dense>
                        <For each={suggestions()}>
                            {(u) => (
                                <ListItem>
                                    <ListItemButton
                                        onMouseDown={(event) => {
                                            event.preventDefault()
                                            selectUser(u?.username ?? "")
                                        }}
                                    >
                                        <ListItemText primary={u.username} secondary={u.email}></ListItemText>
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </For>
                    </List>
                </Box>
            </Popper>
        </>
    )
}
