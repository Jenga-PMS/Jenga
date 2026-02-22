import { Button } from "@suid/material";
import { useContext } from "solid-js";
import { I18nContext } from "../provider/I18nProvider";

export const LangButton = () => {
    const i18n = useContext(I18nContext);

    const handleToggleLanguage = async () => {
        const nextLanguage = i18n?.language()?.startsWith("de") ? "en" : "de";
        if (!nextLanguage || !i18n) return;

        await i18n.changeLanguage(nextLanguage);
    };

    return (
        <Button
            onClick={() => void handleToggleLanguage()}
            variant="outlined"
            color="inherit"
        >
            {i18n?.language()?.startsWith("de") ? i18n?.t("lang.de") : i18n?.t("lang.en")}
        </Button>
    );
};
