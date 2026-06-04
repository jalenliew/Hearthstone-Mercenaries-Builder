package com.example.demo.model.card;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Battlegrounds {
    private boolean hero;
    private boolean quest;
    private boolean reward;
    private boolean duosOnly;
    private boolean solosOnly;
    private List<Integer> subsetTribes;
    private String image;
    private String imageGold;

    // Hero specific
    private int heroPowerId;
    private boolean companionId;

    // Minion specific
    private int tier;
    private int upgradeId;
}