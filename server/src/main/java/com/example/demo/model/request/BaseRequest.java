package com.example.demo.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class BaseRequest {

    @Pattern(regexp = "us|eu|kr|tw|cn", message = "Invalid region")
    private String region = "us";

    private String locale;
}