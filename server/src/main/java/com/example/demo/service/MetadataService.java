package com.example.demo.service;

import com.example.demo.model.metadata.*;
import com.example.demo.model.request.MetadataRequest;
import com.example.demo.model.response.FilterOption;
import com.example.demo.model.response.FilterResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MetadataService {

    private static final String HEARTHSTONE_METADATA = "/hearthstone/metadata";

    private static final Map<String, String> FIELD_TO_ENDPOINT = Map.of(
        "cardSetId",     "sets",
        "rarityId",      "rarities",
        "cardTypeId",    "types",
        "spellSchoolId", "spellSchools",
        "minionTypeId",  "minionTypes",
        "keywordId",     "keywords",
        "classId",       "classes"
    );

    @Autowired
    private BattlenetService battlenetService;

    public Mono<FilterResponse> getFilterOptions(MetadataRequest request) {
        Map<String, String> params = Map.of(
            "region", request.getRegion() != null ? request.getRegion() : "us",
            "locale", request.getLocale() != null ? request.getLocale() : "en_US"
        );

        Mono<List<String>> numericFieldsMono = battlenetService.makeRequestWithParams(
            params, HEARTHSTONE_METADATA + "/numericFields",
            new ParameterizedTypeReference<List<String>>() {}
        );

        Mono<List<String>> filterableFieldsMono = battlenetService.makeRequestWithParams(
            params, HEARTHSTONE_METADATA + "/filterableFields",
            new ParameterizedTypeReference<List<String>>() {}
        );

        return Mono.zip(numericFieldsMono, filterableFieldsMono)
            .flatMap(tuple -> {
                List<String> numericFields = tuple.getT1();
                List<String> filterableFields = tuple.getT2();

                List<String> selectableFieldNames = filterableFields.stream()
                    .filter(f -> !numericFields.contains(f) && !f.equals("collectible"))
                    .collect(Collectors.toList());

                List<Mono<FilterOption>> numericMonos = numericFields.stream()
                    .map(field -> getNumericRange(params, field))
                    .collect(Collectors.toList());

                List<Mono<FilterOption>> selectableMonos = selectableFieldNames.stream()
                    .map(field -> getSelectableOptions(params, field))
                    .collect(Collectors.toList());

                List<Mono<FilterOption>> allMonos = new ArrayList<>();
                allMonos.addAll(numericMonos);
                allMonos.addAll(selectableMonos);

                return Flux.merge(allMonos)
                    .collectList()
                    .map(options -> {
                        List<FilterOption> numeric = options.stream()
                            .filter(o -> o.getMin() != null)
                            .sorted(Comparator.comparingInt(o -> numericFields.indexOf(o.getField())))
                            .collect(Collectors.toList());

                        List<FilterOption> selectable = options.stream()
                            .filter(o -> o.getOptions() != null)
                            .sorted(Comparator.comparingInt(o -> selectableFieldNames.indexOf(o.getField())))
                            .collect(Collectors.toList());

                        return new FilterResponse(numeric, selectable);
                    });
            });
    }

    private Mono<FilterOption> getNumericRange(Map<String, String> params, String field) {
        if ("armor".equals(field)) {
            Map<String, String> armorParams = new HashMap<>(params);
            armorParams.put("type", "hero");

            Mono<Map> armorMono = battlenetService.makeRequestWithParams(armorParams, "/hearthstone/cards", Map.class);
            return armorMono.map(value -> {
                return extractArmorValues(value, field);
            });
        }

        Map<String, String> ascParams = new HashMap<>(params);
        ascParams.put("sort", field + ":asc");
        Map<String, String> descParams = new HashMap<>(params);
        descParams.put("sort", field + ":desc");
        ascParams.put("type", "minion,weapon");
        descParams.put("type", "minion,weapon");

        Mono<Map> ascMono = battlenetService.makeRequestWithParams(ascParams, "/hearthstone/cards", Map.class);
        Mono<Map> descMono = battlenetService.makeRequestWithParams(descParams, "/hearthstone/cards", Map.class);

        return Mono.zip(ascMono, descMono)
            .map(tuple -> {
                int min = extractStatValue(tuple.getT1(), field);
                int max = extractStatValue(tuple.getT2(), field);
                return new FilterOption(field, formatLabel(field), min, max);
            });
    }

    private int extractStatValue(Map response, String field) {
        try {
            List<Map> cards = (List<Map>) response.get("cards");
            if (cards == null || cards.isEmpty()) return 0;
            cards = cards.stream().filter(card -> card.get(field) != null).collect(Collectors.toList());
            for (Map card : cards) {
                Object val = card.get(field);
                if (val != null) return ((Number) val).intValue();
            }
        } catch (Exception e) {
            return 0;
        }
        return 0;
    }

    private FilterOption extractArmorValues(Map response, String field) {
        try {
            FilterOption res = new FilterOption(field, formatLabel(field), 0, 0);
            List<Map> cards = (List<Map>) response.get("cards");
            if (cards == null || cards.isEmpty()) return res;
            cards = cards.stream().filter(card -> card.get(field) != null).collect(Collectors.toList());
            for (Map card : cards) {
                Object val = card.get(field);
                if (val != null) {
                    int value = ((Number) val).intValue();
                    if (value > res.getMax()) {
                        res.setMax(value);
                    }
                    if (value < res.getMin()) {
                        res.setMin(value);
                    }
                }
            }
            return res;
        } catch (Exception e) {
            return new FilterOption(field, formatLabel(field), 0, 0);
        }
    }

    private Mono<FilterOption> getSelectableOptions(Map<String, String> params, String field) {
        String endpoint = FIELD_TO_ENDPOINT.get(field);
        if (endpoint == null) {
            return Mono.just(new FilterOption(field, formatLabel(field), Collections.emptyList()));
        }

        return battlenetService.makeRequestWithParams(
            params,
            HEARTHSTONE_METADATA + "/" + endpoint,
            new ParameterizedTypeReference<List<Metadata>>() {}
        ).map(options -> new FilterOption(field, formatLabel(field), options));
    }

    private String formatLabel(String field) {
        return field
            .replaceAll("Id$", "")
            .replaceAll("([a-z])([A-Z])", "$1 $2")
            .substring(0, 1).toUpperCase()
            + field.replaceAll("Id$", "")
                   .replaceAll("([a-z])([A-Z])", "$1 $2")
                   .substring(1);
    }
}