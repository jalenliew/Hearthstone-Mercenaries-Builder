package com.example.demo.model.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CardPageRequest extends HearthstoneRequest {

    @NotNull(message = "page is required")
    @Min(value = 1, message = "page must be at least 1")
    private Integer page;

    @Min(value = 1)
    @Max(value = 500)
    private Integer pageSize = 16;

    @Pattern(regexp = "^(name|manaCost|attack|health|class):(asc|desc)$")
    private String sort = "name:asc";

    private String textFilter;
    private String set = "standard";
    private String cardClass;
    private String manaCost;
    private String attack;
    private String health;
    private String collectible = "1";
    private String rarity;
    private String type;
    private String minionType;
    private String keyword;
    private String spellSchool;
}