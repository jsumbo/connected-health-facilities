

from typing import Any, Dict, List, Optional, TypedDict


class FacilityRecord(TypedDict):
    slug: str
    name: str
    county: str
    district: str
    facility_type: str
    region: str
    cluster: str


PROGRAMME_FACILITY_TARGET = 37

PROGRAMME_CLUSTERS: List[str] = [
    "Montserrado",
    "Margibi",
    "Grand Cape Mount",
    "Lofa",
    "Nimba",
    "Southeast Region",
]


_COUNTY_META: Dict[str, Dict[str, str]] = {
    "montserrado": {"region": "Western", "cluster": "Montserrado"},
    "margibi": {"region": "Western", "cluster": "Margibi"},
    "grand_cape_mount": {"region": "Western", "cluster": "Grand Cape Mount"},
    "lofa": {"region": "North", "cluster": "Lofa"},
    "nimba": {"region": "North", "cluster": "Nimba"},
    "maryland": {"region": "South-East", "cluster": "Southeast Region"},
    "river_gee": {"region": "South-East", "cluster": "Southeast Region"},
    "grand_gedeh": {"region": "South-East", "cluster": "Southeast Region"},
    "river_cess": {"region": "South-East", "cluster": "Southeast Region"},
}


def _display_name(slug: str) -> str:
    return slug.replace("_", " ").replace("  ", " ").title().replace("Hc", "HC")


def _meta(county_slug: str) -> Dict[str, str]:
    return _COUNTY_META.get(
        county_slug,
        {"region": "Other", "cluster": county_slug.replace("_", " ").title()},
    )


# All 37 facilities (general + sentiment surveys both cover this set).
FACILITY_REGISTRY: List[FacilityRecord] = [
    {"slug": "gw_harley_hospital", "name": "GW Harley Hospital", "county": "nimba", "district": "sanniquelleh_mahn_district", "facility_type": "hospital", **_meta("nimba")},
    {"slug": "damballa_health_center", "name": "Damballa Health Center", "county": "grand_cape_mount", "district": "porkpa_district", "facility_type": "health_centre", **_meta("grand_cape_mount")},
    {"slug": "massaquoi_town_health_center", "name": "Massaquoi Town Health Center", "county": "margibi", "district": "gibi_district", "facility_type": "health_centre", **_meta("margibi")},
    {"slug": "kakata_health_center", "name": "Kakata Health Center", "county": "margibi", "district": "kakata_district", "facility_type": "health_centre", **_meta("margibi")},
    {"slug": "karnplay_health_center", "name": "Karnplay Health Center", "county": "nimba", "district": "gbehlay_geh_district", "facility_type": "health_centre", **_meta("nimba")},
    {"slug": "sacleapea_comprehensive_health_center", "name": "Sacleapea Comprehensive Health Center", "county": "nimba", "district": "saclepea_mah_district", "facility_type": "health_centre", **_meta("nimba")},
    {"slug": "pleebo_health_center", "name": "Pleebo Health Center", "county": "maryland", "district": "pleebo_sodoken_district", "facility_type": "health_centre", **_meta("maryland")},
    {"slug": "sarbo_health_center", "name": "Sarbo Health Center", "county": "river_gee", "district": "sarbo_district", "facility_type": "health_centre", **_meta("river_gee")},
    {"slug": "lofa_bridge_health_center", "name": "Lofa Bridge Health Center", "county": "grand_cape_mount", "district": "gola_konneh_district", "facility_type": "health_centre", **_meta("grand_cape_mount")},
    {"slug": "nyehn_health_center", "name": "Nyehn Health Center", "county": "montserrado", "district": "todee_district", "facility_type": "health_centre", **_meta("montserrado")},
    {"slug": "bahn_health_center", "name": "Bahn Health Center", "county": "nimba", "district": "zoe_geh_district", "facility_type": "health_centre", **_meta("nimba")},
    {"slug": "sinje_health_center", "name": "Sinje Health Center", "county": "grand_cape_mount", "district": "garwula_district", "facility_type": "health_centre", **_meta("grand_cape_mount")},
    {"slug": "new_georgia_community_health_center", "name": "New Georgia Community Health Center", "county": "montserrado", "district": "somalia_drive_district", "facility_type": "health_centre", **_meta("montserrado")},
    {"slug": "gbeapo_health_center", "name": "Gbeapo Health Center", "county": "river_gee", "district": "gbeapo_district", "facility_type": "health_centre", **_meta("river_gee")},
    {"slug": "konobo_health_center", "name": "Konobo Health Center", "county": "grand_gedeh", "district": "konobo_district", "facility_type": "health_centre", **_meta("grand_gedeh")},
    {"slug": "bromely_community_health_center", "name": "Bromely Community Health Center", "county": "montserrado", "district": "st_paul_river_district", "facility_type": "health_centre", **_meta("montserrado")},
    {"slug": "j_n_davies_hospital", "name": "J N Davies Hospital", "county": "montserrado", "district": "somalia_drive_district", "facility_type": "hospital", **_meta("montserrado")},
    {"slug": "chocolate_city_hc", "name": "Chocolate City HC", "county": "montserrado", "district": "somalia_drive_district", "facility_type": "health_centre", **_meta("montserrado")},
    {"slug": "barnersville_hc", "name": "Barnersville HC", "county": "montserrado", "district": "somalia_drive_district", "facility_type": "health_centre", **_meta("montserrado")},
    {"slug": "foya_health_center", "name": "Foya Health Center", "county": "lofa", "district": "foya_district", "facility_type": "health_centre", **_meta("lofa")},
    {"slug": "vahun_health_center", "name": "Vahun Health Center", "county": "lofa", "district": "vahun_district", "facility_type": "health_centre", **_meta("lofa")},
    {"slug": "gbarzon_health_center", "name": "Gbarzon Health Center", "county": "grand_gedeh", "district": "gbao_district", "facility_type": "health_centre", **_meta("grand_gedeh")},
    {"slug": "jj_dossen_hospital", "name": "JJ Dossen Hospital", "county": "maryland", "district": "maryland", "facility_type": "hospital", **_meta("maryland")},
    {"slug": "konia_health_center", "name": "Konia Health Center", "county": "lofa", "district": "zorzor_district", "facility_type": "health_centre", **_meta("lofa")},
    {"slug": "duport_road_health_center", "name": "Duport Road Health Center", "county": "montserrado", "district": "commonwealth_district", "facility_type": "health_centre", **_meta("montserrado")},
    {"slug": "dr__agnes_varis_health_center", "name": "Dr. Agnes Varis Health Center", "county": "montserrado", "district": "commonwealth_district", "facility_type": "clinic", **_meta("montserrado")},
    {"slug": "pipeline_health_center", "name": "Pipeline Health Center", "county": "montserrado", "district": "commonwealth_district", "facility_type": "health_centre", **_meta("montserrado")},
    {"slug": "cotton_tree_health_center", "name": "Cotton Tree Health Center", "county": "margibi", "district": "firestone_district", "facility_type": "health_centre", **_meta("margibi")},
    {"slug": "unification_town_health_center", "name": "Unification Town Health Center", "county": "margibi", "district": "mambah_kaba_district", "facility_type": "health_centre", **_meta("margibi")},
    {"slug": "dolo_s_town_health_center", "name": "Dolo's Town Health Center", "county": "margibi", "district": "firestone_district", "facility_type": "health_centre", **_meta("margibi")},
    {"slug": "waho_health_center", "name": "Waho Health Center", "county": "grand_cape_mount", "district": "tewor_district", "facility_type": "health_centre", **_meta("grand_cape_mount")},
    {"slug": "soniwen_health_center", "name": "Soniwen Health Center", "county": "montserrado", "district": "central_monrovia_district", "facility_type": "health_centre", **_meta("montserrado")},
    {"slug": "boegeezay_health_center", "name": "Boegeezay Health Center", "county": "river_cess", "district": "doedian_district", "facility_type": "health_centre", **_meta("river_cess")},
    {"slug": "rh_ferguson_health_center", "name": "RH Ferguson Health Center", "county": "montserrado", "district": "somalia_drive_district", "facility_type": "health_centre", **_meta("montserrado")},
    {"slug": "clara_town_health_center", "name": "Clara Town Health Center", "county": "montserrado", "district": "central_monrovia_district", "facility_type": "health_centre", **_meta("montserrado")},
    {"slug": "marshall_health_center", "name": "Marshall Health Center", "county": "margibi", "district": "mambah_kaba_district", "facility_type": "health_centre", **_meta("margibi")},
    {"slug": "garzon_health_center", "name": "Garzon Health Center", "county": "margibi", "district": "firestone_district", "facility_type": "health_centre", **_meta("margibi")},
]


def all_programme_facilities() -> List[FacilityRecord]:
    """Full programme facility list."""
    return list(FACILITY_REGISTRY)


def registry_by_slug() -> Dict[str, FacilityRecord]:
    return {f["slug"]: f for f in FACILITY_REGISTRY}


def county_display(county_slug: str) -> str:
    if county_slug in ("unknown", "", None):
        return "Unknown"
    return _display_name(county_slug)


def cluster_sort_key(cluster: str) -> tuple[int, int | str]:
    """Sort clusters in programme display order, then alphabetically for unknowns."""
    try:
        return (0, PROGRAMME_CLUSTERS.index(cluster))
    except ValueError:
        return (1, cluster.lower())
