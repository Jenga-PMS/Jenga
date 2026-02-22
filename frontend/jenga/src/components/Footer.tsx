import { Box } from "@suid/material"
import { A } from "@solidjs/router"
import { useContext } from "solid-js";
import { I18nContext } from "../provider/I18nProvider";

export const Footer = () => {
    const i18n = useContext(I18nContext);

    return (
        <Box
            component="footer"
            sx={{
                display: "flex",
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "100%",
                justifyContent: "center",
            }}
        >
            <A href="/Privacy">{i18n?.t("footer.privacyPolicy")}</A>
        </Box>
    )
}
