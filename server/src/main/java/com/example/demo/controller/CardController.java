package com.example.demo.controller;

import com.example.demo.model.Card;
import com.example.demo.model.response.ApiResponse;
import com.example.demo.model.response.CardPage;
import com.example.demo.model.request.CardRequest;
import com.example.demo.model.request.CardPageRequest;
import com.example.demo.service.BattlenetTokenService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/battlenet/hearthstone/cards")
public class CardController extends HearthstoneController {

    protected static final String PATH = HEARTHSTONE_PATH + "/cards";

    public CardController(BattlenetTokenService tokenService) {
        super(tokenService);
    }

    @GetMapping("/page")
    public Mono<ApiResponse<CardPage>> getCardPage(
        @Valid @ModelAttribute CardPageRequest request
    ) {
        return makeRequest(request, PATH, CardPage.class)
            .map(ApiResponse::ok);
    }

    @GetMapping("/{idorslug}")
    public Mono<ApiResponse<Card>> getCard(
        @PathVariable String idorslug,
        @Valid @ModelAttribute CardRequest request
    ) {
        return makeRequest(request, PATH + "/" + idorslug, Card.class)
            .map(ApiResponse::ok);
    }
}