import { A } from "@solidjs/router"
import { Box, List, ListItem, ListItemButton } from "@suid/material"
import { useContext } from "solid-js"
import { I18nContext } from "../provider/I18nProvider"

export const Sidebar = () => {
    const i18n = useContext(I18nContext)

    return (
        <Box>
            <nav>
                <List>
                    <ListItem>
                        <ListItemButton component={A} href="/">{i18n?.t("sidebar.home")}</ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton component={A} href="/Profile">{i18n?.t("sidebar.profile")}</ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton component={A} href="/Sprint">{i18n?.t("sidebar.sprint")}</ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton component={A} href="/About">{i18n?.t("sidebar.about")}</ListItemButton>
                    </ListItem>
                </List>
            </nav>
        </Box>)
}
