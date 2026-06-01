package com.example.demo.model.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class HearthstoneRequest extends BaseRequest {
    private String gameMode;
}