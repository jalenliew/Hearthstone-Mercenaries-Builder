package com.example.demo.model;

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
    private String slug;
    private String name;
    private String image;
    private int manaCost;
    private int attack;
    private int health;
    private String type;
    private String rarity;
    private String flavorText;
    private String text;
}