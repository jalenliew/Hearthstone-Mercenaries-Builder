package com.example.demo.controller;

import com.example.demo.service.BattlenetService;
import com.example.demo.service.BattlenetTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import reactor.core.publisher.Mono;

public abstract class BattlenetController {

    @Autowired
    protected BattlenetService battlenetService;

    protected BattlenetController(BattlenetTokenService tokenService) {}

    protected <T> Mono<T> makeRequest(Object request, String path, Class<T> responseType) {
        return battlenetService.makeRequest(request, path, responseType);
    }

    protected <T> Mono<T> makeRequest(Object request, String path, ParameterizedTypeReference<T> responseType) {
        return battlenetService.makeRequest(request, path, responseType);
    }
}