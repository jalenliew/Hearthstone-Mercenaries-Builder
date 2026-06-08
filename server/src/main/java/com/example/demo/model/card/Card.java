package com.example.demo.model.card;

import com.example.demo.model.LocalizedString;
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
    private Integer classId;
    private List<Integer> multiClassIds;
    private Integer spellSchoolId;
    private Integer cardTypeId;
    private Integer cardSetId;
    private Integer rarityId;
    private String artistName;
    private Integer health;
    private Integer attack;
    private Integer manaCost;
    private Integer armor;
    private LocalizedString name;
    private LocalizedString text;
    private LocalizedString image;
    private LocalizedString imageGold;
    private LocalizedString flavorText;
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