import i18next from "i18next";
import { Accessor, createContext, createSignal, JSXElement, onCleanup, onMount, Show, useContext } from "solid-js"

import en from "../locales/en.json"
import de from "../locales/de.json"


type I18nContextType = {
    t: (key: string, options?: Record<string, unknown>) => string;
    language: Accessor<string>;
    changeLanguage: (lng: string) => Promise<void>;
}

export const I18nContext = createContext<I18nContextType>()

interface I18nProviderProps {
    children: JSXElement
}

export const I18nProvider = (props: I18nProviderProps) => {
    const [language, setLanguage] = createSignal("");
    const [ready, setReady] = createSignal(false);

    const changeLanguage = async (lng: string) => {
        await i18next.changeLanguage(lng);
    };

    onMount(() => {
        const handleLanguageChanged = (lng: string) => setLanguage(lng);
        i18next.on("languageChanged", handleLanguageChanged);

        const initializeI18n = async () => {
            if (!i18next.isInitialized) {
                await i18next.init({
                    lng: "en",
                    fallbackLng: "en",
                    returnNull: false,
                    returnEmptyString: false,
                    resources: {
                        en: {
                            translation: en
                        },
                        de: {
                            translation: de
                        }
                    }
                });
            }
            setLanguage(i18next.language);
            setReady(true);
        };

        void initializeI18n();

        onCleanup(() => {
            i18next.off("languageChanged", handleLanguageChanged);
        });
    });

    const value: I18nContextType = {
        t: (key: string, options?: Record<string, unknown>) => {
            language();
            const translated = i18next.t(key, options);
            return translated || key;
        },
        language,
        changeLanguage
    }

    return (
        <I18nContext.Provider value={value}>
            <Show when={ready()}>
                {props.children}
            </Show>
        </I18nContext.Provider>
    )

};
