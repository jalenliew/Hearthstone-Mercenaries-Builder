package com.example.demo.model.response;

import com.example.demo.model.metadata.Metadata;
import com.example.demo.model.LocalizedString;
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
public class FilterOption {
    private String field;
    private LocalizedString label;
    private Integer min;
    private Integer max;
    private List<Metadata> options;

    public FilterOption(String field, String label, int min, int max) {
        this.field = field;
        this.label = new LocalizedString(label);
        this.min = min;
        this.max = max;
    }

    public FilterOption(String field, String label, List<Metadata> options) {
        this.field = field;
        this.label = new LocalizedString(label);
        this.options = options;
    }
}
