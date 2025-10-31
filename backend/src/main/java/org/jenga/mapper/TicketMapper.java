package org.jenga.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.jenga.model.Ticket;
import org.jenga.model.Label;
import org.jenga.model.AcceptanceCriteria;
import org.jenga.dto.TicketDTO;
import org.jenga.dto.CreateTicketDTO;
import org.jenga.dto.AcceptanceCriteriaResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import org.mapstruct.Named;

@Mapper(componentModel = "cdi")
public interface TicketMapper {

    TicketMapper INSTANCE = Mappers.getMapper(TicketMapper.class);

    @Mapping(source = "project.name", target = "projectName")
    @Mapping(source = "reporter.username", target = "reporterName")
    @Mapping(source = "assignee.username", target = "assigneeName")
    @Mapping(source = "labels", target = "labels")
    @Mapping(target = "acceptanceCriteria", source = "acceptanceCriteria")
    @Mapping(target = "relatedTicketsIds", source = "relatedTickets", qualifiedByName = "mapRelatedTicketsToIds")
    @Mapping(target = "blockingTicketIds", source = "blockingTickets", qualifiedByName = "mapBlockingTicketsToIds")
    @Mapping(target = "blockedTicketIds", source = "blockedTickets", qualifiedByName = "mapBlockedTicketsToIds")
    TicketDTO ticketToTicketDTO(Ticket ticket);

    @Mapping(source = "projectName", target = "project.name")
    @Mapping(source = "assigneeName", target = "assignee.username")
    @Mapping(source = "labels", target = "labels")
    @Mapping(target = "relatedTickets", ignore = true)
    Ticket ticketDTOToTicket(TicketDTO ticketDTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createDate", ignore = true)
    @Mapping(target = "modifyDate", ignore = true)
    @Mapping(target = "reporter", ignore = true)
    @Mapping(target = "assignee", ignore = true)
    @Mapping(source = "labels", target = "labels")
    Ticket createTicketDTOToTicket(CreateTicketDTO createTicketDTO);

    // Map List<Label> labels to List<String> labels
    default List<String> mapLabelsToLabelNames(List<Label> labels) {
        if (labels == null) {
            return null;
        }
        return labels.stream()
                     .map(Label::getName)
                     .collect(Collectors.toList());
    }

    // Map List<String> labels to List<Label> labels
    default List<Label> mapLabelNamesToLabels(List<String> labelNames) {
        if (labelNames == null) {
            return null;
        }

        return labelNames.stream()
                         .map(name -> {
                             Label label = new Label();
                             label.setName(name);
                             return label;
                         })
                         .collect(Collectors.toList());
    }
    
    // Map AcceptanceCriteria model to AcceptanceCriteria DTO
    default List<AcceptanceCriteriaResponse> mapAcceptanceCriteriaToResponse(List<AcceptanceCriteria> criteria) {
        if (criteria == null) {
            return null;
        }
        return criteria.stream()
                       .map(this::mapAcceptanceCriteriaToResponse)
                       .collect(Collectors.toList());
    }

    // Single mapping of AcceptanceCriteria model to AcceptanceCriteria DTO
    default AcceptanceCriteriaResponse mapAcceptanceCriteriaToResponse(AcceptanceCriteria criteria) {
        if (criteria == null) {
            return null;
        }
        AcceptanceCriteriaResponse response = new AcceptanceCriteriaResponse();
        response.setId(criteria.getId());
        response.setDescription(criteria.getDescription());
        response.setCompleted(criteria.isCompleted());
        return response;
    }

    // Map the related tickets list to just their IDs
    @Named("mapRelatedTicketsToIds")  // Explicitly needed, as MapStruct cannot find it otherwise
    default List<Long> mapRelatedTicketsToIds(List<Ticket> relatedTickets) {
        if (relatedTickets == null) {
            return null;
        }
        return relatedTickets.stream()
                             .map(Ticket::getId)
                             .collect(Collectors.toList());
    }

    // Map blockingTickets list to a List<Long> of IDs
    @Named("mapBlockingTicketsToIds")
    default List<Long> mapBlockingTicketsToIds(List<Ticket> blockingTickets) {
        if (blockingTickets == null) {
            return null;
        }
        return blockingTickets.stream()
                              .map(Ticket::getId)
                              .collect(Collectors.toList());
    }

    // Map blockedTickets list to a List<Long> of IDs
    @Named("mapBlockedTicketsToIds")
    default List<Long> mapBlockedTicketsToIds(List<Ticket> blockedTickets) {
        if (blockedTickets == null) {
            return null;
        }
        return blockedTickets.stream()
                             .map(Ticket::getId)
                             .collect(Collectors.toList());
    }
}
