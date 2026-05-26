package com.example.demo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.Map;

@Service
public class BattlenetTokenService {

    @Value("${battlenet.client-id}")
    private String clientId;

    @Value("${battlenet.client-secret}")
    private String clientSecret;

    @Value("${battlenet.region}")
    private String region;

    private String cachedToken;
    private Instant tokenExpiry;

    private final WebClient webClient = WebClient.create();

    public synchronized String getAccessToken() {
        if (cachedToken != null && Instant.now().isBefore(tokenExpiry.minusSeconds(60))) {
            return cachedToken;
        }
        return fetchNewToken();
    }

    private String fetchNewToken() {
        String tokenUrl = "https://" + region + ".battle.net/oauth/token";

        Map response = webClient.post()
            .uri(tokenUrl)
            .headers(h -> h.setBasicAuth(clientId, clientSecret))
            .bodyValue("grant_type=client_credentials")
            .header("Content-Type", "application/x-www-form-urlencoded")
            .retrieve()
            .bodyToMono(Map.class)
            .block();

        cachedToken = (String) response.get("access_token");
        int expiresIn = (int) response.get("expires_in");
        tokenExpiry = Instant.now().plusSeconds(expiresIn);

        return cachedToken;
    }
}