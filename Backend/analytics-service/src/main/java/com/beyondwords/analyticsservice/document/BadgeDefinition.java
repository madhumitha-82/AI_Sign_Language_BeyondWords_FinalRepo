package com.beyondwords.analyticsservice.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "badge_definitions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeDefinition {
    @Id
    private String id;
    private String name;
    private String description;
    private String icon;
    private String tier;
    private String criteria;
    private Integer xpReward;
    private String status;
}
