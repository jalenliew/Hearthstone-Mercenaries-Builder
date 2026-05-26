package com.example.demo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/battlenet")
@CrossOrigin(origins = "http://localhost:5173")
public class BattlenetProxyController {

    @Value("${battlenet.region}")
    private String region;

    private final BattlenetTokenService tokenService;
    private final WebClient webClient = WebClient.create();

    public BattlenetProxyController(BattlenetTokenService tokenService) {
        this.tokenService = tokenService;
    }

    @GetMapping("/cards/page")
    public Mono<Map> getCardPage(@RequestParam Map<String, String> params) {
        String token = tokenService.getAccessToken();
        String host = "https://" + params.getOrDefault("region", region) + ".api.blizzard.com";

        org.springframework.web.util.UriComponentsBuilder builder =
            org.springframework.web.util.UriComponentsBuilder
                .fromHttpUrl(host + "/hearthstone/cards");

        params.forEach((key, value) -> {
            if (!key.equals("region")) {
                builder.queryParam(key, value);
            }
        });

        return webClient.get()
            .uri(builder.toUriString())
            .header("Authorization", "Bearer " + token)
            .retrieve()
            .bodyToMono(Map.class);
    }
}