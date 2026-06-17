package com.example.demo.controller;

import com.example.demo.model.card.*;
import com.example.demo.model.response.ApiResponse;
import com.example.demo.model.request.CardsRequest;
import com.example.demo.service.BattlenetTokenService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/battlenet/hearthstone/cards")
public class CardsController extends HearthstoneController {

    protected static final String PATH = HEARTHSTONE_PATH + "/cards";

    public CardsController(BattlenetTokenService tokenService) {
        super(tokenService);
    }

    @GetMapping("/page")
    public Mono<ApiResponse<Page>> getPage(
        @Valid @ModelAttribute CardsRequest request
    ) {
        if (!request.getGameMode().equals("constructed")) {
            request.setCollectible("0");
        }
        return makeRequest(request, PATH, Page.class)
            .map(ApiResponse::ok);
    }

    @GetMapping("/{idorslug}")
    public Mono<ApiResponse<Card>> getCard(
        @PathVariable String idorslug,
        @Valid @ModelAttribute CardsRequest request
    ) {
        if (request.getGameMode() != "constructed") {
            request.setCollectible("0");
        }
        return makeRequest(request, PATH + "/" + idorslug, Card.class)
            .map(ApiResponse::ok);
    }
}