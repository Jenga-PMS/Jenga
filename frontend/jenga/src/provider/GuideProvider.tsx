import { createContext, JSXElement, onCleanup, onMount, useContext } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { LayoutContext } from "./LayoutProvider";
import { I18nContext } from "./I18nProvider";

import "shepherd.js/dist/css/shepherd.css";
import Shepherd from "shepherd.js";

type GuideContextType = {
    startGuide: () => void;
    stopGuide: () => void;
};

interface GuideProviderProps {
    children: JSXElement;
}

export const GuideContext = createContext<GuideContextType>();

export const GuideProvider = (props: GuideProviderProps) => {
    const navigate = useNavigate();
    const lCtx = useContext(LayoutContext);
    const i18n = useContext(I18nContext);
    const tour = new Shepherd.Tour({
        defaultStepOptions: {
            classes: "shepherd-theme-arrows",
            scrollTo: true,
            cancelIcon: {
                enabled: true,
            },
            buttons: [
                {
                    text: i18n?.t("guide.back"),
                    action: () => tour.back(),
                },
                {
                    text: i18n?.t("guide.next"),
                    action: () => tour.next(),
                },
            ],
        },
        useModalOverlay: true,
    });

    const waitForElement = async (selector: string, timeoutMs = 2000) => {
        const startedAt = Date.now();

        while (!document.querySelector(selector)) {
            if (Date.now() - startedAt > timeoutMs) {
                throw new Error(`Guide target not found: ${selector}`);
            }
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        }
    };

    const goToPathAndWaitFor = async (path: string, selector: string, timeoutMs = 2000) => {
        navigate(path);
        await waitForElement(selector, timeoutMs);
    };

    const ensureSidebarVisible = async () => {
        lCtx?.setSidebarOpen(true);
    };

    const getSteps = (): Shepherd.Step.StepOptions[] => [
        {
            id: "welcome",
            title: i18n?.t("guide.steps.welcome.title"),
            text: i18n?.t("guide.steps.welcome.text"),
        },
        {
            id: "navigation",
            title: i18n?.t("guide.steps.navigation.title"),
            text: i18n?.t("guide.steps.navigation.text"),
            attachTo: {
                element: "#guide-nav-toggle",
                on: "bottom",
            },
            beforeShowPromise: () => waitForElement("#guide-nav-toggle"),
        },
        {
            id: "sidebar",
            title: i18n?.t("guide.steps.sidebar.title"),
            text: i18n?.t("guide.steps.sidebar.text"),
            attachTo: {
                element: "#guide-sidebar",
                on: "right",
            },
            beforeShowPromise: async () => {
                await ensureSidebarVisible();
                await waitForElement("#guide-sidebar");
            },
        },
        {
            id: "projects",
            title: i18n?.t("guide.steps.projects.title"),
            text: i18n?.t("guide.steps.projects.text"),
            attachTo: {
                element: "#guide-projects",
                on: "bottom",
            },
            beforeShowPromise: () => goToPathAndWaitFor("/", "#guide-projects"),
        },
        {
            id: "file-import",
            title: i18n?.t("guide.steps.fileImport.title"),
            text: i18n?.t("guide.steps.fileImport.text"),
            attachTo: {
                element: "#guide-file-import",
                on: "top",
            },
            beforeShowPromise: () => goToPathAndWaitFor("/", "#guide-file-import"),
        },
        {
            id: "ticket-filter",
            title: i18n?.t("guide.steps.ticketFilter.title"),
            text: i18n?.t("guide.steps.ticketFilter.text"),
            attachTo: {
                element: "#guide-ticket-filter",
                on: "bottom",
            },
            beforeShowPromise: () => goToPathAndWaitFor("/Sprint", "#guide-ticket-filter"),
        },
        {
            id: "kanban",
            title: i18n?.t("guide.steps.kanban.title"),
            text: i18n?.t("guide.steps.kanban.text"),
            attachTo: {
                element: "#guide-kanban",
                on: "top",
            },
            beforeShowPromise: () => goToPathAndWaitFor("/Sprint", "#guide-kanban"),
        },
        {
            id: "backlog",
            title: i18n?.t("guide.steps.backlog.title"),
            text: i18n?.t("guide.steps.backlog.text"),
            attachTo: {
                element: "#guide-backlog",
                on: "top",
            },
            beforeShowPromise: () => goToPathAndWaitFor("/Sprint", "#guide-backlog"),
        },
        {
            id: "ticket-details",
            title: i18n?.t("guide.steps.ticketDetails.title"),
            text: i18n?.t("guide.steps.ticketDetails.text"),
            attachTo: {
                element: "#guide-ticket-details",
                on: "left",
            },
            beforeShowPromise: () => goToPathAndWaitFor("/Sprint", "#guide-ticket-details"),
        },
        {
            id: "done",
            title: i18n?.t("guide.steps.done.title"),
            text: i18n?.t("guide.steps.done.text"),
            beforeShowPromise: () => goToPathAndWaitFor("/Sprint", "#guide-ticket-details"),
            buttons: [
                {
                    text: i18n?.t("guide.back"),
                    action: () => tour.back(),
                },
                {
                    text: i18n?.t("guide.finish"),
                    action: () => tour.complete(),
                },
            ],
        },
    ];

    onMount(() => {
        tour.addSteps(getSteps());
    });


    const startGuide = () => {
        if (tour.isActive()) {
            tour.cancel();
        }

        tour.start();
    };

    const stopGuide = () => {
        tour.cancel();
    };

    onCleanup(() => {
        tour.cancel();
    });

    const value: GuideContextType = {
        startGuide,
        stopGuide,
    };

    return <GuideContext.Provider value={value}>{props.children}</GuideContext.Provider>;
};
