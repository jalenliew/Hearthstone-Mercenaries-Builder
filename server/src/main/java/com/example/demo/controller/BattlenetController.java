package com.example.demo.controller;

import com.example.demo.service.BattlenetTokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Objects;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Map;

public abstract class BattlenetController {

    @Autowired
    protected ObjectMapper objectMapper;

    protected final BattlenetTokenService tokenService;
    protected final WebClient webClient = WebClient.create();

    @Value("${battlenet.region}")
    protected String defaultRegion;

    protected BattlenetController(BattlenetTokenService tokenService) {
        this.tokenService = tokenService;
    }

    protected String getHost(String region) {
        return "https://" + region + ".api.blizzard.com";
    }

    protected <T> Mono<T> makeRequest(Object request, String path, Class<T> responseType) {
        Map<String, String> params = objectMapper.convertValue(request, 
            new TypeReference<Map<String, String>>() {});
        params.values().removeIf(Objects::isNull);

        String region = params.getOrDefault("region", defaultRegion);

        UriComponentsBuilder builder = UriComponentsBuilder
            .fromHttpUrl(getHost(region) + path);

        params.forEach((key, value) -> {
            if (!key.equals("region")) builder.queryParam(key, value);
        });

        return webClient.get()
            .uri(builder.toUriString())
            .header("Authorization", "Bearer " + tokenService.getAccessToken())
            .retrieve()
            .onStatus(status -> status.is4xxClientError(), response ->
                Mono.error(new ResponseStatusException(response.statusCode(), "Battle.net client error"))
            )
            .onStatus(status -> status.is5xxServerError(), response ->
                Mono.error(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Battle.net server error"))
            )
            .bodyToMono(responseType);
    }
}