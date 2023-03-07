package com.soen.project.entities.appointment;

import java.time.LocalTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static java.lang.String.format;
import static java.time.temporal.ChronoUnit.MINUTES;

public class TimeSlots {

    static public final Map<Integer, String> timeslots;

    static {
        Map<Integer, String> slots = new HashMap<>();
        int[] durations = {15, 30, 45, 60};
        LocalTime time = LocalTime.of(8, 0);
        int durationIndex = 0, timeslotIndex = 0;
        while (time.isBefore(LocalTime.of(20, 0))) {
            durationIndex = durationIndex % durations.length;
            slots.put(timeslotIndex++, format("%s-%s", time.toString(), (time = time.plus(durations[durationIndex++], MINUTES)).toString()));
        }
        timeslots = Collections.unmodifiableMap(slots);
    }
}
