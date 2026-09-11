def separate_with_comma(string: str) -> set[str]:
    return set(item.strip() for item in string.split(',') if item.strip())


def has_intersection(set1: set[str], set2: set[str]) -> bool:
    return not set1.isdisjoint(set2)
