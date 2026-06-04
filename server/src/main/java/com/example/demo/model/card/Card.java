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
public class Card {
    private int id;
    private boolean collectible;
    private String slug;
    private int classId;
    private List<Integer> multiClassIds;
    private int spellSchoolId;
    private int cardTypeId;
    private int cardSetId;
    private int rarityId;
    private String artistName;
    private int health;
    private int attack;
    private int manaCost;
    private String name;
    private String text;
    private String image;
    private String imageGold;
    private String flavorText;
    private String cropImage;
    private List<Integer> childIds;
    private List<Integer> keywordIds;
    private boolean isZilliaxFunctionalModule;
    private boolean isZilliaxCosmeticModule;
    // Battlegrounds
    private Battlegrounds battlegrounds;
    // Mercenaries
    private Mercenary mercenaryHero;
}