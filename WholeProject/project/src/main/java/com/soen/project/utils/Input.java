package com.soen.project.utils;

import java.util.HashMap;
import java.util.Map;

public class Input {

    public static Map<String, String> trimInputToNull(Map<String, String> body){
        Map<String, String> trimmed = new HashMap<>();
        for(Map.Entry<String, String> entry : body.entrySet()){
            String value = entry.getValue().trim();
            value = value.length() == 0 ? null : value;
            trimmed.put(entry.getKey(), value);
        }
        return trimmed;
    }
}
