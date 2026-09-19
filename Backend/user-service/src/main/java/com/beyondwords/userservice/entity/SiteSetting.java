package com.beyondwords.userservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "site_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteSetting {
    @Id
    @Column(name = "settings_key", nullable = false, length = 50)
    private String key;

    @Column(name = "settings_value", columnDefinition = "TEXT")
    private String value;
}
