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

@RestController
@RequestMapping("/api/battlenet/hearthstone/metadata")
public class MetadataController extends HearthstoneController {
    protected static final String PATH = HEARTHSTONE_PATH + "/metadata";

    public MetadataController(BattlenetTokenService tokenService) {
        super(tokenService);
    }

    @GetMapping
    public Mono<ApiResponse<Metadata>> getMetadata(
        @Valid @ModelAttribute MetadataRequest request
    ) {
        return makeRequest(request, PATH, Metadata.class)
            .map(ApiResponse::ok);
    }

    @GetMapping("/sets")
    public Mono<ApiResponse<List<CardSet>>> getTypeMetadata(
        @Valid @ModelAttribute MetadataRequest request
    ) {
        return makeRequest(request, PATH + "/sets", new ParameterizedTypeReference<List<CardSet>>() {})
            .map(ApiResponse::ok);
    }

    @GetMapping("/{type}")
    public Mono<ApiResponse<Metadata>> getTypeMetadata(
        @PathVariable String type,
        @Valid @ModelAttribute MetadataRequest request
    ) {
        return makeRequest(request, PATH + "/" + type, Metadata.class)
            .map(ApiResponse::ok);
    }
}
