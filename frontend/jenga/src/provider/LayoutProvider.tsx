import { Accessor, createContext, createSignal, JSXElement, Setter } from "solid-js";

type LayoutContextType = {
    sidebarOpen: Accessor<boolean>;
    setSidebarOpen: Setter<boolean>;
    toggleSidebar: () => void;
    openChat: Accessor<boolean>;
    setOpenChat: Setter<boolean>;
}

export const LayoutContext = createContext<LayoutContextType>();

interface LayoutProviderProps {
    children: JSXElement;
}

export const LayoutProvider = (props: LayoutProviderProps) => {
    const [sidebarOpen, setSidebarOpen] = createSignal(false);

    const [openChat, setOpenChat] = createSignal(false);

    const value: LayoutContextType = {
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar: () => setSidebarOpen((prev) => !prev),        openChat,
        setOpenChat
    };

    return (
        <LayoutContext.Provider value={value}>
            {props.children}
        </LayoutContext.Provider>
    )
}
