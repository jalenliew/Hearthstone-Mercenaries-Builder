package com.example.demo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Objects;

@Service
public class BattlenetService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BattlenetTokenService tokenService;

    @Value("${battlenet.region}")
    private String defaultRegion;

    private final WebClient webClient = WebClient.create();

    public String getHost(String region) {
        return "https://" + region + ".api.blizzard.com";
    }

    public <T> Mono<T> makeRequest(Object request, String path, Class<T> responseType) {
        Map<String, String> params = toParams(request);
        String url = buildUrl(params, path);
        return execute(url, responseType);
    }

    public <T> Mono<T> makeRequest(Object request, String path, ParameterizedTypeReference<T> responseType) {
        Map<String, String> params = toParams(request);
        String url = buildUrl(params, path);
        return execute(url, responseType);
    }

    public <T> Mono<T> makeRequestWithParams(Map<String, String> params, String path, Class<T> responseType) {
        String url = buildUrl(params, path);
        return execute(url, responseType);
    }

    public <T> Mono<T> makeRequestWithParams(Map<String, String> params, String path, ParameterizedTypeReference<T> responseType) {
        String url = buildUrl(params, path);
        return execute(url, responseType);
    }

    private Map<String, String> toParams(Object request) {
        Map<String, String> params = objectMapper.convertValue(request,
            new TypeReference<Map<String, String>>() {});
        params.values().removeIf(Objects::isNull);
        return params;
    }

    private String buildUrl(Map<String, String> params, String path) {
        String region = params.getOrDefault("region", defaultRegion);
        UriComponentsBuilder builder = UriComponentsBuilder
            .fromHttpUrl(getHost(region) + path);
        params.forEach((key, value) -> {
            if (!key.equals("region")) builder.queryParam(key, value);
        });
        return builder.toUriString();
    }

    private <T> Mono<T> execute(String url, Class<T> responseType) {
        return webClient.get()
            .uri(url)
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

    private <T> Mono<T> execute(String url, ParameterizedTypeReference<T> responseType) {
        return webClient.get()
            .uri(url)
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