import { Accessor, JSXElement, Resource, Setter, createContext, createEffect, createResource, createSignal, useContext } from "solid-js";
import { ProjectResponseDTO, ProjectResourceService, TicketRequestDTO, TicketResponseDTO, TicketResourceService } from "../api";
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
    createLabel: (labelName: string) => Promise<string>;
    deleteLabel: (labelName: string) => Promise<void>;

    availableLabels?: Resource<string[]>;
};

export const ProjectContext = createContext<ProjectContextType>();

interface ProviderProps {
    children: JSXElement;
}

export const ProjectProvider = (props: ProviderProps) => {

    const aCtx = useContext(AuthContext);

    const [selectedProject, setSelectedProject] = createSignal<ProjectResponseDTO>();
    const [selectedTicket, setSelectedTicket] = createSignal<TicketResponseDTO>();
    const selectedProjectId = () => selectedProject()?.identifier;

    const getLabelColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i += 1) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        const rgb = (hash & 0x00FFFFFF).toString(16).toUpperCase().padStart(6, "0");
        return `#${rgb}`;
    };

    const normalizeAcceptanceCriteria = (criteria: TicketResponseDTO["acceptanceCriteria"] | undefined) =>
        (criteria ?? [])
            .map((entry) => ({
                id: entry.id,
                description: (entry.description ?? "").trim(),
                completed: Boolean(entry.completed),
            }))
            .filter((entry) => entry.description.length > 0);

    const normalizeTicketIds = (ids: number[] | undefined, ticketId: number) =>
        [...new Set((ids ?? []).filter((id) => id > 0 && id !== ticketId))];

    const toTicketRequest = (ticket: TicketResponseDTO): TicketRequestDTO => ({
        title: ticket.title ?? "",
        description: ticket.description ?? "",
        priority: ticket.priority,
        size: ticket.size,
        status: ticket.status,
        projectName: ticket.projectName,
        assignee: ticket.assignee,
        reporter: ticket.reporter,
        labels: ticket.labels ?? [],
        acceptanceCriteria: normalizeAcceptanceCriteria(ticket.acceptanceCriteria).map((entry) => ({
            description: entry.description,
            completed: entry.completed,
        })),
        relatedTicketsIds: ticket.relatedTicketsIds ?? [],
        blockingTicketIds: ticket.blockingTicketIds ?? [],
        blockedTicketIds: ticket.blockedTicketIds ?? [],
    });

    const syncAcceptanceCriteria = async (ticketId: number, nextTicket: TicketResponseDTO) => {
        const nextCriteria = normalizeAcceptanceCriteria(nextTicket.acceptanceCriteria);

        const existing = await TicketResourceService.getApiTicketsAcceptanceCriteria(ticketId);
        for (const item of existing) {
            if (item.id == null) continue;
            await TicketResourceService.deleteApiTicketsAcceptanceCriteria(item.id, ticketId);
        }

        for (const entry of nextCriteria) {
            await TicketResourceService.postApiTicketsAcceptanceCriteria(ticketId, {
                description: entry.description,
                completed: entry.completed,
            });
        }
    };

    const syncTicketLinks = async (ticketId: number, nextTicket: TicketResponseDTO) => {
        const currentTicket = await TicketResourceService.getApiTickets1(ticketId);

        const currentRelated = new Set(normalizeTicketIds(currentTicket.relatedTicketsIds, ticketId));
        const nextRelated = new Set(normalizeTicketIds(nextTicket.relatedTicketsIds, ticketId));

        for (const relatedId of currentRelated) {
            if (!nextRelated.has(relatedId)) {
                await TicketResourceService.deleteApiTicketsRelated(relatedId, ticketId);
            }
        }
        for (const relatedId of nextRelated) {
            if (!currentRelated.has(relatedId)) {
                await TicketResourceService.putApiTicketsRelated(relatedId, ticketId);
            }
        }

        const currentBlocking = new Set(normalizeTicketIds(currentTicket.blockingTicketIds, ticketId));
        const nextBlocking = new Set(normalizeTicketIds(nextTicket.blockingTicketIds, ticketId));

        for (const blockingId of currentBlocking) {
            if (!nextBlocking.has(blockingId)) {
                await TicketResourceService.deleteApiTicketsBlock(blockingId, ticketId);
            }
        }
        for (const blockingId of nextBlocking) {
            if (!currentBlocking.has(blockingId)) {
                await TicketResourceService.putApiTicketsBlock(blockingId, ticketId);
            }
        }

        const currentBlocked = new Set(normalizeTicketIds(currentTicket.blockedTicketIds, ticketId));
        const nextBlocked = new Set(normalizeTicketIds(nextTicket.blockedTicketIds, ticketId));

        for (const blockedId of currentBlocked) {
            if (!nextBlocked.has(blockedId)) {
                await TicketResourceService.deleteApiTicketsBlock(ticketId, blockedId);
            }
        }
        for (const blockedId of nextBlocked) {
            if (!currentBlocked.has(blockedId)) {
                await TicketResourceService.putApiTicketsBlock(ticketId, blockedId);
            }
        }
    };

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

    const [availableLabels, { mutate: setAvailableLabels }] = createResource(
        () => (aCtx?.isLoggedIn?.() ? selectedProjectId() : undefined),
        async (projectId) => {
            const labels = await ProjectResourceService.getApiProjectsLabels(projectId);
            return labels
                .map((label) => (label.name ?? "").trim())
                .filter((label): label is string => Boolean(label));
        }
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

        const previousTickets = tickets();
        const previousSelectedTicket = selectedTicket();

        setTickets((prev) =>
            prev?.map((existing) => (existing.id === ticket.id ? { ...existing, ...ticket } : existing)) ?? prev
        );
        setSelectedTicket((prev) => (prev?.id === ticket.id ? { ...prev, ...ticket } : prev));

        try {
            const request = toTicketRequest(ticket);
            await TicketResourceService.putApiTickets(ticket.id, request);
            await syncAcceptanceCriteria(ticket.id, ticket);
            await syncTicketLinks(ticket.id, ticket);
            const refreshedTicket = await TicketResourceService.getApiTickets1(ticket.id);

            setTickets((prev) =>
                prev?.map((existing) => (existing.id === ticket.id ? { ...existing, ...refreshedTicket } : existing)) ?? prev
            );

            setSelectedTicket((prev) => (prev?.id === ticket.id ? { ...prev, ...refreshedTicket } : prev));
        } catch (error) {
            console.error("Failed to update ticket", error);
            setTickets(() => previousTickets);
            setSelectedTicket(() => previousSelectedTicket);
            throw error;
        }
    };

    const createLabel = async (labelName: string) => {
        const projectId = selectedProjectId();
        const nextLabel = labelName.trim();
        if (!projectId || !nextLabel) {
            throw new Error("Missing project or label name");
        }

        if ((availableLabels() ?? []).includes(nextLabel)) {
            return nextLabel;
        }

        try {
            const created = await ProjectResourceService.postApiProjectsLabels(projectId, {
                name: nextLabel,
                color: getLabelColor(nextLabel),
            });
            const createdLabel = (created.name ?? nextLabel).trim();
            setAvailableLabels((prev) =>
                (prev ?? []).includes(createdLabel) ? prev : [...(prev ?? []), createdLabel]
            );
            return createdLabel;
        } catch (error) {
            console.error("Failed to create label", error);
            throw error;
        }
    };

    const deleteLabel = async (labelName: string) => {
        const projectId = selectedProjectId();
        const nextLabel = labelName.trim();
        if (!projectId || !nextLabel) {
            return;
        }

        try {
            await ProjectResourceService.deleteApiProjectsLabels(nextLabel, projectId);
            setAvailableLabels((prev) => prev?.filter((label) => label !== nextLabel));
        } catch (error) {
            console.error("Failed to delete label", error);
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
        updateTicket,
        createLabel,
        deleteLabel,
        availableLabels
    };

    createEffect(() => {
        const _ = selectedProject();
        setSelectedTicket(undefined);
    });

    return (
        <ProjectContext.Provider value={value}>
            {props.children}
        </ProjectContext.Provider>
    );
};
