import { Accessor, JSXElement, Resource, Setter, createContext, createEffect, createResource, createSignal, useContext } from "solid-js";
import { ProjectResponseDTO, ProjectResourceService, TicketResponseDTO, TicketResourceService } from "../api";
import { AuthContext } from "./AuthProvider";

type ProjectContextType = {
    projects: Resource<ProjectResponseDTO[] | undefined>;
    setProjects: Setter<ProjectResponseDTO[] | undefined>;
    refetchProjects: () => void;

    selectedProject: Accessor<ProjectResponseDTO | undefined>;
    setSelectedProject: Setter<ProjectResponseDTO | undefined>;

    tickets: Resource<TicketResponseDTO[] | undefined>;
    setTickets: Setter<TicketResponseDTO[] | undefined>;
    refetchTickets: () => void;

    selectedTicket: Accessor<TicketResponseDTO | undefined>;
    setSelectedTicket: Setter<TicketResponseDTO | undefined>;
    deleteProject: (identifier: string) => Promise<void>;
    updateTicket: (projectId: string, ticket: TicketResponseDTO) => Promise<void>;
};

export const ProjectContext = createContext<ProjectContextType>();

interface ProviderProps {
    children: JSXElement;
}

export const ProjectProvider = (props: ProviderProps) => {

    const aCtx = useContext(AuthContext);

    const [selectedProject, setSelectedProject] = createSignal<ProjectResponseDTO>();
    const [selectedTicket, setSelectedTicket] = createSignal<TicketResponseDTO>();

    const [projects, { mutate: setProjects, refetch: refetchProjects }] = createResource(
        () => (aCtx?.isLoggedIn?.() ? true : undefined),
        async () => await ProjectResourceService.getApiProjects()
    );

    const [tickets, { mutate: setTickets, refetch: refetchTickets }] = createResource(
        () => {
            const project = selectedProject();
            return aCtx?.isLoggedIn() && project ? project.identifier : undefined;
        },
        async (projectId) => await TicketResourceService.getApiTicketsAll(projectId)
    );

    createEffect(() => {
        if (!aCtx?.isLoggedIn?.()) {
            setProjects(() => undefined);
            setSelectedProject(undefined);
            setTickets(() => undefined);
            setSelectedTicket(undefined);
        }
    });

    const deleteProject = async (identifier: string) => {
        if (!identifier) return;

        try {
            await ProjectResourceService.deleteApiProjects(identifier);
            setProjects((prev) => prev?.filter((project) => project.identifier !== identifier));

            if (selectedProject()?.identifier === identifier) {
                setSelectedProject(undefined);
                setTickets(undefined);
            }
        } catch (error) {
            console.error("Failed to delete project", error);
            throw error;
        }
    };

    const updateTicket = async (projectId: string, ticket: TicketResponseDTO) => {
        if (!projectId || ticket.id == null) {
            console.warn("Missing project or ticket id for update", { projectId, ticketId: ticket.id });
            return;
        }

        try {
            const newTicket = await TicketResourceService.putApiTickets(ticket.id, ticket)

            setTickets((prev) =>
                prev?.map((existing) => (existing.id === ticket.id ? { ...existing, ...newTicket } : existing)) ?? prev
            );

            setSelectedTicket((prev: TicketResponseDTO) => (prev?.id === ticket.id ? { ...prev, ...newTicket } : prev));
        } catch (error) {
            console.error("Failed to update ticket", error);
            throw error;
        }
    };

    const value = {
        projects,
        setProjects,
        selectedProject,
        setSelectedProject,
        refetchProjects,
        tickets,
        setTickets,
        refetchTickets,
        selectedTicket,
        setSelectedTicket,
        deleteProject,
        updateTicket
    };

    return (
        <ProjectContext.Provider value={value}>
            {props.children}
        </ProjectContext.Provider>
    );
};
