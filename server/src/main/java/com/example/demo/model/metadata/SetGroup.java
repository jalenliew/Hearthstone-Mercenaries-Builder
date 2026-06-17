package com.example.demo.model.metadata;

import com.example.demo.model.LocalizedString;
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
public class SetGroup {
    private String slug;
    private int year;
    private String svg;
    private List<String> cardSets;
    private LocalizedString name;
    private boolean standard;
    private String icon;
}
