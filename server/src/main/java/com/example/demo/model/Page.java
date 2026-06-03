package com.example.demo.model;

import com.example.demo.model.Card;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Page {
    private List<Card> cards;
    private int cardCount;
    private int pageCount;
    private int page;
}