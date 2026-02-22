import { Box, Chip, List, ListItem, ListItemButton, ListItemText, Popper, TextField } from "@suid/material"
import { Accessor, createMemo, createSignal, For, Setter, useContext } from "solid-js"
import { ProjectContext } from "../provider/ProjectProvider"
import { I18nContext } from "../provider/I18nProvider"


interface LabelSelectorProps {
    selected: Accessor<string[]>
    setSelected: Setter<string[]>
    disabled?: boolean
}

export const LabelSelector = (props: LabelSelectorProps) => {
    const pCtx = useContext(ProjectContext)
    const i18n = useContext(I18nContext)
    let ref: HTMLDivElement | undefined

    const [input, setInput] = createSignal("")
    const [focused, setFocused] = createSignal(false)
    const [createError, setCreateError] = createSignal("")
    const loadError = createMemo(() => {
        if (!focused()) return ""
        return pCtx?.availableLabels?.error ? (i18n?.t("errors.failedLoadLabels") ?? "") : ""
    })
    const hasLabelsError = createMemo(() => Boolean(loadError()))
    const safeAvailableLabels = createMemo(() => {
        if (hasLabelsError()) return []
        return pCtx?.availableLabels?.() ?? []
    })

    const suggestions = createMemo(() => {
        const labels = safeAvailableLabels()
        const query = input().trim().toLowerCase()

        return labels
            .filter((label) => !props.selected().includes(label))
            .filter((label) => query.length === 0 || label.toLowerCase().includes(query))
            .slice(0, 8)
    })

    const open = createMemo(() => focused() && !props.disabled && !hasLabelsError() && suggestions().length > 0)

    const addLabel = async (value: string) => {
        if (hasLabelsError()) {
            setCreateError(i18n?.t("errors.failedLoadLabels") ?? "")
            return
        }

        const label = value.trim()
        if (!label) return

        setCreateError("")
        const knownLabels = safeAvailableLabels()
        let labelToUse = label

        if (!knownLabels.includes(label) && pCtx?.createLabel) {
            try {
                labelToUse = await pCtx.createLabel(label)
            } catch (error) {
                console.error("Failed to persist label", error)
                setCreateError(i18n?.t("errors.failedCreateLabel") ?? "")
                return
            }
        }

        props.setSelected((prev) => (prev.includes(labelToUse) ? prev : [...prev, labelToUse]))
        setInput("")
    }

    const removeLabel = (label: string) => {
        props.setSelected((prev) => prev.filter((item) => item !== label))
    }

    return (
        <>
            <div ref={(el) => ref = el}>
                <TextField
                    label={i18n?.t("labels.label")}
                    value={input()}
                    onChange={(event) => {
                        setInput(event.currentTarget.value)
                        if (createError()) setCreateError("")
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === ",") {
                            event.preventDefault()
                            void addLabel(input())
                        }
                    }}
                    disabled={props.disabled}
                    error={hasLabelsError() || Boolean(createError())}
                    helperText={createError() || loadError() || undefined}
                    fullWidth
                />
            </div>

            <Popper anchorEl={ref} open={open()} placement="bottom-start" style={{ "z-index": 1600 }}>
                <Box backgroundColor="white">
                    <List dense>
                        <For each={suggestions()}>
                            {(label) => (
                                <ListItem>
                                    <ListItemButton
                                        onMouseDown={(event) => {
                                            event.preventDefault()
                                            void addLabel(label)
                                        }}
                                    >
                                        <ListItemText primary={label} />
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </For>
                    </List>
                </Box>
            </Popper>

            <Box>
                <For each={props.selected()}>
                    {(label) => (
                        <Chip
                            label={label}
                            onDelete={props.disabled ? undefined : () => removeLabel(label)}
                            size="small"
                        />
                    )}
                </For>
            </Box>
        </>
    )
}
