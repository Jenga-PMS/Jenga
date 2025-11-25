package org.jenga.mapper;

import org.jenga.dto.AcceptanceCriteriaRequestDTO;
import org.jenga.dto.AcceptanceCriteriaResponseDTO;
import org.jenga.model.AcceptanceCriteria;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "cdi")
public interface AcceptanceCriteriaMapper {

    AcceptanceCriteriaMapper INSTANCE = Mappers.getMapper(AcceptanceCriteriaMapper.class);

    AcceptanceCriteria toEntity(AcceptanceCriteriaRequestDTO request);

    AcceptanceCriteriaResponseDTO toResponse(AcceptanceCriteria entity);
}
