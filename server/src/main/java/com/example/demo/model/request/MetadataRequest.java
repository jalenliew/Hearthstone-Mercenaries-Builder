package com.example.demo.model.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MetadataRequest extends HearthstoneRequest {
    private String type;
}
