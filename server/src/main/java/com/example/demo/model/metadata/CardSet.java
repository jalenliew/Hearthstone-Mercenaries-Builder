package com.example.demo.model.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CardSet extends Metadata {
    private List<Integer> aliasSetIds;
    private boolean hyped;
    private String type;
    private int collectibleCount;
    private int collectibleRevealedCount;
    private int nonCollectibleCount;
    private int nonCollectibleRevealedCount;
}
