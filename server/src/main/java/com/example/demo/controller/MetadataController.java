package com.example.demo.controller;

import com.example.demo.model.metadata.*;
import com.example.demo.model.response.ApiResponse;
import com.example.demo.model.request.MetadataRequest;
import com.example.demo.service.BattlenetTokenService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.ParameterizedTypeReference;
import reactor.core.publisher.Mono;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/battlenet/hearthstone/metadata")
public class MetadataController extends HearthstoneController {
    protected static final String PATH = HEARTHSTONE_PATH + "/metadata";
    protected Set<String> withGM = Set.of("types", "minionTypes");

    public MetadataController(BattlenetTokenService tokenService) {
        super(tokenService);
    }

    @GetMapping("/sets")
    public Mono<ApiResponse<List<CardSet>>> getCardSetMetadata(
        @Valid @ModelAttribute MetadataRequest request
    ) {
        return makeRequest(request, PATH + "/sets", new ParameterizedTypeReference<List<CardSet>>() {})
            .map(ApiResponse::ok);
    }

    @GetMapping("/rarities")
    public Mono<ApiResponse<List<Rarity>>> getRarityMetadata(
        @Valid @ModelAttribute MetadataRequest request
    ) {
        return makeRequest(request, PATH + "/rarities", new ParameterizedTypeReference<List<Rarity>>() {})
            .map(ApiResponse::ok);
    }

    @GetMapping("/classes")
    public Mono<ApiResponse<List<HeroClass>>> getClassMetadata(
        @Valid @ModelAttribute MetadataRequest request
    ) {
        return makeRequest(request, PATH + "/classes", new ParameterizedTypeReference<List<HeroClass>>() {})
            .map(ApiResponse::ok);
    }

    @GetMapping("/keywords")
    public Mono<ApiResponse<List<Keyword>>> getKeywordMetadata(
        @Valid @ModelAttribute MetadataRequest request
    ) {
        return makeRequest(request, PATH + "/keywords", new ParameterizedTypeReference<List<Keyword>>() {})
            .map(ApiResponse::ok);
    }

    @GetMapping("/{type}")
    public Mono<ApiResponse<List<? extends Metadata>>> getMetadata(
        @PathVariable String type,
        @Valid @ModelAttribute MetadataRequest request
    ) {
        if (withGM.contains(type)) {
            return makeRequest(request, PATH + "/" + type, new ParameterizedTypeReference<List<MetadataGM>>() {})
                .map(ApiResponse::ok);
        } else {
            return makeRequest(request, PATH + "/" + type, new ParameterizedTypeReference<List<Metadata>>() {})
                .map(ApiResponse::ok);
        }
    }
}
