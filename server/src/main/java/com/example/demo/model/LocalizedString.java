package com.example.demo.model;

import com.example.demo.model.deserializer.LocalizedStringDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Getter;
import lombok.Setter;
import java.util.Map;

@JsonDeserialize(using = LocalizedStringDeserializer.class)
@Getter
@Setter
public class LocalizedString {
    private String value;
    private Map<String, String> values;

    public String get(String locale) {
        if (value != null) return value;
        return values != null ? values.get(locale) : null;
    }
}
