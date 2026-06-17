package com.example.demo.service;

import com.example.demo.model.metadata.*;
import com.example.demo.model.request.MetadataRequest;
import com.example.demo.model.response.FilterOption;
import com.example.demo.model.response.FilterResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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

    private static final List<String> MANUAL_SELECTABLE_FIELDS = List.of(
        "classId", "keywordId", "minionTypeId"
    );

    @Autowired
    private BattlenetService battlenetService;

    @Value("${battlenet.region}")
    private String defaultRegion;

    public Mono<FilterResponse> getFilterOptions(MetadataRequest request) {
        Map<String, String> params = new HashMap<>();
        params.put("region", request.getRegion() != null ? request.getRegion() : defaultRegion);
        if (request.getLocale() != null) {
            params.put("locale", request.getLocale());
        }

        Mono<List<String>> numericFieldsMono = battlenetService.makeRequestWithParams(
            params, HEARTHSTONE_METADATA + "/numericFields",
            new ParameterizedTypeReference<List<String>>() {}
        );

        Mono<List<String>> filterableFieldsMono = battlenetService.makeRequestWithParams(
            params, HEARTHSTONE_METADATA + "/filterableFields",
            new ParameterizedTypeReference<List<String>>() {}
        );

        Mono<List<SetGroup>> setGroupsMono = battlenetService.makeRequestWithParams(
            params, HEARTHSTONE_METADATA + "/setGroups",
            new ParameterizedTypeReference<List<SetGroup>>() {}
        );

        Mono<List<HeroClass>> classesMono = battlenetService.makeRequestWithParams(
            params, HEARTHSTONE_METADATA + "/classes",
            new ParameterizedTypeReference<List<HeroClass>>() {}
        );

        Mono<List<Keyword>> keywordsMono = battlenetService.makeRequestWithParams(
            params, HEARTHSTONE_METADATA + "/keywords",
            new ParameterizedTypeReference<List<Keyword>>() {}
        );

        Mono<List<MetadataGM>> minionTypesMono = battlenetService.makeRequestWithParams(
            params, HEARTHSTONE_METADATA + "/minionTypes",
            new ParameterizedTypeReference<List<MetadataGM>>() {}
        );

        return Mono.zip(numericFieldsMono, filterableFieldsMono, setGroupsMono, classesMono, keywordsMono, minionTypesMono)
            .flatMap(tuple -> {
                List<String> numericFields = tuple.getT1();
                List<String> filterableFields = tuple.getT2();
                List<SetGroup> setGroups = tuple.getT3();
                List<HeroClass> classes = tuple.getT4();
                List<Keyword> keywords = tuple.getT5();
                List<MetadataGM> minionTypes = tuple.getT6();

                List<String> selectableFieldNames = filterableFields.stream()
                    .filter(f -> !numericFields.contains(f) && !f.equals("collectible"))
                    .collect(Collectors.toList());

                List<Mono<FilterOption>> numericMonos = numericFields.stream()
                    .map(field -> getNumericRange(params, field))
                    .collect(Collectors.toList());

                List<Mono<FilterOption>> selectableMonos = selectableFieldNames.stream()
                    .map(field -> getSelectableOptions(params, field))
                    .collect(Collectors.toList());

                Mono<FilterOption> classesOption = Mono.just(
                    new FilterOption("classId", "Class",
                        classes.stream()
                            .map(c -> (Metadata) c)
                            .collect(Collectors.toList()))
                );

                Mono<FilterOption> keywordsOption = Mono.just(
                    new FilterOption("keywordId", "Keyword",
                        keywords.stream()
                            .map(k -> (Metadata) k)
                            .collect(Collectors.toList()))
                );

                Mono<FilterOption> minionTypesOption = Mono.just(
                    new FilterOption("minionTypeId", "Minion Type",
                        minionTypes.stream()
                            .map(m -> (Metadata) m)
                            .collect(Collectors.toList()))
                );

                List<Mono<FilterOption>> allMonos = new ArrayList<>();
                allMonos.addAll(numericMonos);
                allMonos.addAll(selectableMonos);
                allMonos.add(classesOption);
                allMonos.add(keywordsOption);
                allMonos.add(minionTypesOption);

                List<String> allSelectableNames = new ArrayList<>(selectableFieldNames);
                allSelectableNames.addAll(MANUAL_SELECTABLE_FIELDS);

                return Flux.merge(allMonos)
                    .collectList()
                    .map(options -> {
                        List<FilterOption> numeric = options.stream()
                            .filter(o -> o.getMin() != null)
                            .sorted(Comparator.comparingInt(o ->
                                numericFields.indexOf(((FilterOption) o).getField())))
                            .collect(Collectors.toList());

                        List<FilterOption> selectable = options.stream()
                            .filter(o -> o.getOptions() != null)
                            .sorted(Comparator.comparingInt(o -> {
                                int idx = allSelectableNames.indexOf(((FilterOption) o).getField());
                                return idx == -1 ? Integer.MAX_VALUE : idx;
                            }))
                            .collect(Collectors.toList());

                        return new FilterResponse(numeric, selectable, setGroups);
                    });
            });
    }

    private Mono<FilterOption> getNumericRange(Map<String, String> params, String field) {
        if ("armor".equals(field)) {
            Map<String, String> armorParams = new HashMap<>(params);
            armorParams.put("type", "hero");

            return battlenetService.makeRequestWithParams(armorParams, "/hearthstone/cards", Map.class)
                .map(response -> extractArmorValues(response, field));
        }

        Map<String, String> ascParams = new HashMap<>(params);
        ascParams.put("sort", field + ":asc");
        ascParams.put("type", "minion,weapon");
        ascParams.put("pageSize", "1");
        ascParams.put("page", "1");

        Map<String, String> descParams = new HashMap<>(params);
        descParams.put("sort", field + ":desc");
        descParams.put("type", "minion,weapon");
        descParams.put("pageSize", "1");
        descParams.put("page", "1");

        return Mono.zip(
            battlenetService.makeRequestWithParams(ascParams, "/hearthstone/cards", Map.class),
            battlenetService.makeRequestWithParams(descParams, "/hearthstone/cards", Map.class)
        ).map(tuple -> {
            int min = extractStatValue(tuple.getT1(), field);
            int max = extractStatValue(tuple.getT2(), field);
            return new FilterOption(field, formatLabel(field), min, max);
        });
    }

    private int extractStatValue(Map response, String field) {
        try {
            List<Map> cards = (List<Map>) response.get("cards");
            if (cards == null || cards.isEmpty()) return 0;
            return cards.stream()
                .filter(card -> card.get(field) != null)
                .map(card -> ((Number) card.get(field)).intValue())
                .findFirst()
                .orElse(0);
        } catch (Exception e) {
            return 0;
        }
    }

    private FilterOption extractArmorValues(Map response, String field) {
        try {
            FilterOption res = new FilterOption(field, formatLabel(field), 0, 0);
            List<Map> cards = (List<Map>) response.get("cards");
            if (cards == null || cards.isEmpty()) return res;

            List<Integer> values = cards.stream()
                .filter(card -> card.get(field) != null)
                .map(card -> ((Number) card.get(field)).intValue())
                .collect(Collectors.toList());

            if (values.isEmpty()) return res;
            res.setMin(Collections.min(values));
            res.setMax(Collections.max(values));
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
        String stripped = field.replaceAll("Id$", "").replaceAll("([a-z])([A-Z])", "$1 $2");
        return stripped.substring(0, 1).toUpperCase() + stripped.substring(1);
    }
}