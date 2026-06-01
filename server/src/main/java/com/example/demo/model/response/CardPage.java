package com.example.demo.model.response;

import com.example.demo.model.Card;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CardPage {
    private List<Card> cards;
    private int cardCount;
    private int pageCount;
    private int page;
}