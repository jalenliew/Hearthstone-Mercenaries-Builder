package com.example.demo.model;

import java.util.Map;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Mercenary {
    private int mercId;
    @JsonProperty("default")
    private boolean defaultMercenary;
    private Map<Integer, Map<String, Integer>> statsByLevel;
    private int roleId;
    private int rarity;
    private boolean collectible;
    private int craftingCost;
    private int faction;
}
