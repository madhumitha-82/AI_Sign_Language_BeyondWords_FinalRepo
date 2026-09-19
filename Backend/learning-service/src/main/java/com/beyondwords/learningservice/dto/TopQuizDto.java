package com.beyondwords.learningservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopQuizDto {
    private String category;
    private long attempts;
}
