# scheduler.py

from itertools import product
from typing import List, Dict, Tuple
from datetime import datetime


def parse_days(days_str: str) -> List[str]:
    """
    Converts CSV day strings into normalized day tokens.

    Supported examples:
      MWF  -> ["M", "W", "F"]
      TTh  -> ["T", "R"]

    Conventions:
      M = Monday
      T = Tuesday
      W = Wednesday
      R = Thursday
      F = Friday
    """
    normalized = days_str.strip()

    if normalized == "MWF":
        return ["M", "W", "F"]

    if normalized == "TTh":
        return ["T", "R"]

    raise ValueError(f"Unsupported day format: {days_str}")


def parse_time_string_to_minutes(time_str: str) -> int:
    """
    Converts a time like '09:00 AM' or '06:15 PM' into minutes since midnight.
    """
    parsed = datetime.strptime(time_str.strip(), "%I:%M %p")
    return parsed.hour * 60 + parsed.minute


def parse_time_range(time_str: str) -> Tuple[int, int]:
    """
    Converts a CSV time range like '09:00 AM-10:15 AM'
    into minutes since midnight.
    """
    parts = [part.strip() for part in time_str.split("-")]

    if len(parts) != 2:
        raise ValueError(f"Invalid time range format: {time_str}")

    start_minutes = parse_time_string_to_minutes(parts[0])
    end_minutes = parse_time_string_to_minutes(parts[1])

    return start_minutes, end_minutes


def sections_conflict(section_a: Dict, section_b: Dict) -> bool:
    """
    Returns True if two sections overlap on any shared day and time.
    """
    days_a = set(parse_days(section_a["days"]))
    days_b = set(parse_days(section_b["days"]))

    shared_days = days_a.intersection(days_b)
    if not shared_days:
        return False

    start_a, end_a = parse_time_range(section_a["time"])
    start_b, end_b = parse_time_range(section_b["time"])

    return max(start_a, start_b) < min(end_a, end_b)


def combination_is_conflict_free(schedule: List[Dict]) -> bool:
    """
    Returns True if no sections in the schedule conflict with each other.
    """
    for i in range(len(schedule)):
        for j in range(i + 1, len(schedule)):
            if sections_conflict(schedule[i], schedule[j]):
                return False
    return True


def build_conflict_free_schedule(selected_courses: List[str], courses_db: List[Dict]) -> List[Dict]:
    """
    Deterministically selects the first conflict-free combination
    of one section per selected course.

    Raises:
        ValueError: if a selected course has no sections
        RuntimeError: if no valid schedule exists
    """
    grouped_sections = {}

    for code in selected_courses:
        grouped_sections[code] = [
            row for row in courses_db if row["course_code"] == code
        ]

        if not grouped_sections[code]:
            raise ValueError(f"No sections found for course: {code}")

    ordered_section_lists = [grouped_sections[code] for code in selected_courses]

    for combo in product(*ordered_section_lists):
        candidate_schedule = list(combo)
        if combination_is_conflict_free(candidate_schedule):
            return candidate_schedule

    raise RuntimeError("No conflict-free schedule could be built for the selected courses.")
