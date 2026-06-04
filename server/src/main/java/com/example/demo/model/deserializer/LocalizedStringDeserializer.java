package com.example.demo.model.deserializer;

import com.example.demo.model.LocalizedString;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.IOException;

public class LocalizedStringDeserializer extends JsonDeserializer<LocalizedString> {

    @Override
    public LocalizedString deserialize(JsonParser p, DeserializationContext ctxt)
            throws IOException {

        JsonNode node = p.getCodec().readTree(p);
        LocalizedString ls = new LocalizedString();

        if (node.isTextual()) {
            ls.setValue(node.asText());
        } else {
            ObjectMapper mapper = (ObjectMapper) p.getCodec();
            ls.setValues(mapper.convertValue(node, new TypeReference<>() {}));
        }

        return ls;
    }
}
