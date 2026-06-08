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
public class Keyword extends Metadata {
    private LocalizedString refText;
    private LocalizedString text;
    private List<Integer> gameModes;
}
