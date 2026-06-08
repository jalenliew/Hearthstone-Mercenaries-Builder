package com.example.demo.model.response;

import com.example.demo.model.response.FilterOption;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FilterResponse {
    private List<FilterOption> numericFields;
    private List<FilterOption> selectableFields;
}
