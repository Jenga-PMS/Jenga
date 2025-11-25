import { Box } from "@suid/material"
import { A } from "@solidjs/router"

export const Footer = () => {
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
            <A href="/Privacy">Privacy Policy</A>
        </Box>
    )
}
