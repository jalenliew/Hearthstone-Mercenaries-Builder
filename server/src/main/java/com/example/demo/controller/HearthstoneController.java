package com.example.demo.controller;

import com.example.demo.service.BattlenetTokenService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;

@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/battlenet/hearthstone")
public abstract class HearthstoneController extends BattlenetController {

    protected static final String HEARTHSTONE_PATH = "/hearthstone";

    protected HearthstoneController(BattlenetTokenService tokenService) {
        super(tokenService);
    }
}