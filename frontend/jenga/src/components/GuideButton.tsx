import { Button } from "@suid/material"
import { useContext } from "solid-js";
import { GuideContext } from "../provider/GuideProvider"
import { I18nContext } from "../provider/I18nProvider";

export const GuideButton = () => {

    const gCtx = useContext(GuideContext);
    const i18n = useContext(I18nContext);

    return (
        <Button 
            onClick={() => gCtx?.startGuide()}
            variant="contained"
        >
            {i18n?.t("guide.button")}
        </Button>
    )
}
