package com.beyondwords.learningservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonNotesRequestDto {
    private String notesText;
}
