package com.beyondwords.analyticsservice.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "shared_badges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedBadge {
    @Id
    private String id;
    
    private String userEmail;
    private String userName;
    private String badgeId;
    private String badgeTitle;
    private String badgeDescription;
    private String badgeIcon;
    private String badgeTier;
    private Integer badgeXp;
    
    private LocalDateTime sharedAt;
}
