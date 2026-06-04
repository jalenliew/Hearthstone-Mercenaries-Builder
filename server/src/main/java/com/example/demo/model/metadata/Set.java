package com.example.demo.model.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Set extends Metadata {
    private boolean hyped;
    private String type;
    private int collectibleCount;
    private int nonCollectibleCount;
    private int nonCollectibleRevealedCount;
}
