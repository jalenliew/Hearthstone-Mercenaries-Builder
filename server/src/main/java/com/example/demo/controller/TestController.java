package com.example.demo.controller;

import com.example.demo.service.BattlenetTokenService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = "http://localhost:5173")
public class TestController extends BattlenetController {

    public TestController(BattlenetTokenService tokenService) {
        super(tokenService);
    }

    @GetMapping("/raw")
    public Mono<Object> raw(@RequestParam String path, @RequestParam Map<String, String> params) {
        String region = params.getOrDefault("region", defaultRegion);

        UriComponentsBuilder builder = UriComponentsBuilder
            .fromHttpUrl(getHost(region) + path);

        params.forEach((key, value) -> {
            if (!key.equals("region") && !key.equals("path")) {
                builder.queryParam(key, value);
            }
        });

        return webClient.get()
            .uri(builder.toUriString())
            .header("Authorization", "Bearer " + tokenService.getAccessToken())
            .retrieve()
            .bodyToMono(Object.class);
    }
}