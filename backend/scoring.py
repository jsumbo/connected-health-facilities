
from typing import Dict, Any, List, Optional

from facility_master import PROGRAMME_FACILITY_TARGET
from kobo_normalize import (
    FACILITY_PHOTO_FIELD,
    attachment_uid_for_basename,
    display_label,
    normalize_kobo_submission,
    total_functional_devices,
)

CORE_DOMAINS = [
    "B_Governance", "C_Workforce", "D_Infrastructure",
    "E_HealthInformation", "F_DigitalTech", "G_Clinical",
    "I_Financing", "J_OperationalSupport",
]

DOMAIN_LABELS: Dict[str, str] = {
    "B_Governance":        "Governance",
    "C_Workforce":         "Health Workforce",
    "D_Infrastructure":    "Physical Infrastructure",
    "E_HealthInformation": "Health Information",
    "F_DigitalTech":       "Digital Technologies",
    "G_Clinical":          "Clinical Service Delivery",
    "H_SupplyChain":       "Inventory & Supply Chain",
    "I_Financing":         "Financing",
    "J_OperationalSupport": "Operational Support",
}


SCORE_MAP: Dict[str, Dict[str, Any]] = {

    "What_percentage_of_s_liant_with_HR_policy": {   # MEDIUM
        "_80__compliant":    (1, False),
        "81_95__compliant":  (2, False),
        "_95__compliant":    (3, False),
    },
    "How_often_are_HR_aud_ion_visits_conducted": {    # MEDIUM
        "ad_hoc____1_per_quarter": (1, False),
        "2_3_per_quarter":         (2, False),
        "_3_per_quarter":          (3, False),
    },
    "Does_the_facility_have_an_esta": {               # MEDIUM
        "no_mechanism":              (1, False),
        "mechanism_exists__partial": (2, False),
        "full_mechanism_in_place":   (3, False),
    },
    "Does_the_facility_act_on_feedback": {            # MEDIUM
        "not_acted_on":                           (1, False),
        "some_actions":                           (2, False),
        "feedback_always_informs_facility_plans": (3, False),
    },
    "How_would_you_descri_digital_health_tools": {    # *HIGH
        "not_engaged":               (1, True),
        "partially_engaged":         (2, True),
        "actively_driving_adoption": (3, True),
    },
    "How_is_the_facility_perational_stability": {     # *HIGH
        "unstable___frequent_disruptions": (1, True),
        "moderate":                        (2, True),
        "stable_and_predictable":          (3, True),
    },
    "Has_this_facility_ex_tiatives_in_the_past": {    # *HIGH
        "no":  (1, True),
        "yes": (3, True),
    },
    "How_many_supervision_includin": {                # MEDIUM (4 options)
        "none":            (1, False),
        "1_2_per_quarter": (2, False),
        "2_3_per_quarter": (3, False),
        "_3_per_quarter":  (4, False),
    },
    "What_percentage_of_a_ch_supervision_visit": {    # MEDIUM
        "_60__closed":   (1, False),
        "60_84__closed": (2, False),
        "_85__closed":   (3, False),
    },

    "What_percentage_of_s_in_the_last_12_month": {    # *HIGH
        "_60__trained":   (1, True),
        "60_89__trained": (2, True),
        "_90__trained":   (3, True),
    },
    "Do_clinicians_docume_ctly_in_digital_tool": {    # *HIGH
        "no":  (1, True),
        "yes": (3, True),
    },
    "Is_there_a_dedicated_ble_at_this_facility": {    # *HIGH
        "no":                       (1, True),
        "yes___part_time___shared": (2, True),
        "yes___full_time":          (3, True),
    },
    "Is_there_an_ongoing_g_programme_in_place": {     # MEDIUM
        "no":      (1, False),
        "planned": (2, False),
        "yes":     (3, False),
    },


    "What_is_the_primary_power_sour": {               # *HIGH (none = blocker)
        "none":             (0, True),
        "generator":        (1, True),
        "solar___inverter": (2, True),
        "grid":             (3, True),
    },
    "What_backup_power_systems_are_": {               # *HIGH (none = blocker)
        "none":                           (0, True),
        "ups_only":                       (1, True),
        "generator_only":                 (2, True),
        "solar___inverter_only":          (2, True),
        "multiple_backup_systems__speci": (3, True),
    },
    "Is_there_UPS_at_critical_workstations": {        # *HIGH
        "none":                     (1, True),
        "some_workstations":        (2, True),
        "all_critical_workstations": (3, True),
    },
    "Is_there_a_potable_water_suppl": {               # *HIGH
        "no":               (1, True),
        "yes___limited":    (2, True),
        "yes___sufficient": (3, True),
    },
    "Is_the_potable_water_supply_reliable": {         # *HIGH
        "unreliable":   (1, True),
        "intermittent": (2, True),
        "reliable":     (3, True),
    },
    "Are_toilets_and_hand_t_key_points_of_care": {    # MEDIUM
        "limited___non_functional": (1, False),
        "partially_functional":     (2, False),
        "fully_functional":         (3, False),
    },
    "Network_latency_duri_umerator_ping_test": {      # MEDIUM
        "high___unstable__200ms": (1, False),
        "moderate__80_200ms":     (2, False),
        "low___stable__80ms":     (3, False),
    },
    "Mobile_network_signal_strength": {               # MEDIUM (4 options)
        "none":     (1, False),
        "weak":     (2, False),
        "moderate": (3, False),
        "strong":   (4, False),
    },
    "What_proportion_of_e_ctional_Enumerator": {      # MEDIUM
        "50_79__functional": (1, False),
        "80_89__functional": (2, False),
        "_90__functional":   (3, False),
    },
    "How_accurately_are_referrals_i": {               # MEDIUM
        "not_recorded___unknown":         (1, False),
        "recorded_but_incomplete":        (2, False),
        "recorded_routinely_and_reviewe": (3, False),
    },
    "Is_transport_availab_or_patient_referrals": {    # MEDIUM
        "never":     (1, False),
        "sometimes": (2, False),
        "always":    (3, False),
    },
    "Does_the_facility_ha_oms_for_its_services": {    # MEDIUM
        "insufficient___no_dedicated_rooms": (1, False),
        "meets_minimum_standards":           (2, False),
        "optimised_layout":                  (3, False),
    },
    "How_compliant_is_the_ps_toilets_signage": {      # MEDIUM
        "partial__e_g__one_ramp_only": (1, False),
        "_75__compliant":              (2, False),
        "fully_compliant":             (3, False),
    },


    "What_is_the_main_method_used_f": {               # *HIGH
        "paper_only":              (1, True),
        "hybrid__paper___digital": (2, True),
        "fully_digital__emr":      (3, True),
    },
    "What_percentage_of_p_records_are_complete": {    # *HIGH
        "_70__complete":   (1, True),
        "70_89__complete": (2, True),
        "_90__complete":   (3, True),
    },
    "What_percentage_of_f_d_on_time_each_month": {    # *HIGH
        "_70__on_time":   (1, True),
        "70_89__on_time": (2, True),
        "_90__on_time":   (3, True),
    },
    "What_is_the_average_tem_EMR_HIS_uptime": {       # *HIGH
        "_80__uptime":  (1, True),
        "81_94__uptime": (2, True),
        "_95__uptime":  (3, True),
    },
    "Is_duplicate_entry_r_for_routine_services": {    # *HIGH
        "always":                   (1, True),
        "sometimes":                (2, True),
        "no___integrated_workflow": (3, True),
    },
    "What_is_the_usual_ti_and_typical_backlog": {     # *HIGH
        "weekly_batch____7_day_backlog": (1, True),
        "end_of_day___2_7_days":         (2, True),
        "real_time____2_days":           (3, True),
    },
    "How_often_is_data_di_t_or_review_meetings": {    # *HIGH
        "rarely__50__of_meetings": (1, True),
        "sometimes":               (2, True),
        "always__80__of_meetings": (3, True),
    },
    "Is_the_facility_acti_or_the_national_HIS": {     # *HIGH
        "no":                 (1, True),
        "partially":          (2, True),
        "yes___consistently": (3, True),
    },
    "Is_a_unique_client_ID_used_and": {               # *HIGH
        "no":              (1, True),
        "inconsistently":  (2, True),
        "yes___routinely": (3, True),
    },
    "What_is_the_primary_e_registration_point": {     # *HIGH
        "paper_register": (1, True),
        "hybrid":         (2, True),
        "digital_system": (3, True),
    },
    "What_tool_do_clinicians_use_to": {               # *HIGH
        "paper_only":         (1, True),
        "paper___digital":    (2, True),
        "digital__emr__only": (3, True),
    },
    "Are_clinical_templat_during_documentation": {    # MEDIUM
        "no___free_text_only":          (1, False),
        "partially":                    (2, False),
        "yes___structured_fields_used": (3, False),
    },
    "Are_login_credential_etween_staff_members": {    # MEDIUM
        "yes___regularly":           (1, False),
        "sometimes":                 (2, False),
        "no___individual_logins_only": (3, False),
    },
    "How_are_lab_orders_captured": {                  # MEDIUM
        "verbal":         (1, False),
        "paper_only":     (2, False),
        "digital_system": (3, False),
    },
    "How_are_lab_results_requesting_clinician": {     # MEDIUM
        "phone_call":     (1, False),
        "physical_paper": (2, False),
        "digital_system": (3, False),
    },
    "Are_lab_records_link_ent_ID_in_the_system": {    # MEDIUM
        "no":                  (1, False),
        "partially":           (2, False),
        "yes___consistently":  (3, False),
    },

    "Staff_enthusiasm_for_digitisation": {            # *HIGH
        "low":      (1, True),
        "moderate": (2, True),
        "high":     (3, True),
    },
    "How_do_staff_perceiv_burden_or_valuable": {      # *HIGH
        "burdensome": (1, True),
        "neutral":    (2, True),
        "valued":     (3, True),
    },


    "What_is_the_clinical_ased_on_recent_audit": {    # MEDIUM
        "60_70__adherence":   (1, False),
        "71_85__adherence":   (2, False),
        "_90__adherence":     (3, False),
        "n_a___not_in_place": (1, False),
    },
    "What_percentage_of_t_in_system_functional": {    # MEDIUM
        "_80__functional":                              (1, False),
        "_90__reliable":                               (2, False),
        "_95____sops_in_place":                        (3, False),
        "n_a___there_is_not_functional_cold_chain":    None,
    },
    "Are_diagnostic_servi_red_at_this_facility": {    # MEDIUM
        "core_services_only__informal_qa":    (1, False),
        "_80__of_tests_with_qa_checks":       (2, False),
        "external_qa_active____90__accuracy": (3, False),
    },
    "Is_patient_flow_mapp_cross_service_points": {    # MEDIUM
        "mapped___50__adopted":              (1, False),
        "adopted_in__80__of_service_points": (2, False),
        "standardised___quarterly_review":   (3, False),
    },
    # Tracer indicators — N/A choices excluded from denominator
    "For_recent_PPH_cases_rted_after_diagnosis": {    # MEDIUM
        "_30_min_or_not_documented":  (1, False),
        "10_30min":                   (2, False),
        "_10_min___protocol_followed": (3, False),
        "n_a___maternity_not_offered": None,
    },
    "Are_children_6_59_mo_managed_per_protocol": {    # MEDIUM
        "_60__screened___protocol_gaps":        (1, False),
        "60_84__with_partial_adherence":        (2, False),
        "_85__adherence___referrals":           (3, False),
        "n_a___nutrition_services_not_offered": None,
    },
    "In_the_last_10_labou_nitored_per_protocol": {    # MEDIUM
        "_60":                                   (1, False),
        "60_84":                                 (2, False),
        "_85":                                   (3, False),
        "n_a___delivery_services_not_offered":   None,
    },
    "Among_OPD_adults_las_lled_BP_if_diagnosed": {    # MEDIUM
        "_60____not_tracked": (1, False),
        "60_84":              (2, False),
        "_85____follow_up":   (3, False),
    },


    "Average_stock_out_ra_tics_IV_fluids_etc": {      # MEDIUM
        "_15__stock_outs":  (1, False),
        "6_15__stock_outs": (2, False),
        "_5__stock_outs":   (3, False),
    },
    "How_often_is_stock_f_d_how_accurate_is_it": {    # MEDIUM
        "ad_hoc___low_accuracy":       (1, False),
        "monthly___moderate_accuracy": (2, False),
        "automated___high_accuracy":   (3, False),
    },
    "Inventory_system_maturity": {                    # MEDIUM
        "manual":                         (1, False),
        "hybrid___physical":              (2, False),
        "digital_integrated_with_alerts": (3, False),
    },


    "How_frequently_are_f_how_are_they_created": {    # MEDIUM
        "manual___quarterly":             (1, False),
        "accounting_tool____80__on_time": (2, False),
        "digital___monthly_variance__5":  (3, False),
    },
    "What_is_the_cadence_f_invoice_submission": {     # MEDIUM
        "ad_hoc___irregular":                   (1, False),
        "monthly_or_quarterly__delays_common":  (2, False),
        "weekly_or_monthly_on_time":            (3, False),
    },
    "What_percentage_of_f_solved_within_7_days": {    # MEDIUM
        "not_tracked_or__60": (1, False),
        "60_84":              (2, False),
        "_85":                (3, False),
    },
    "What_percentage_of_i_claims_are_rejected": {     # MEDIUM
        "_10__rejected":  (1, False),
        "5_10__rejected": (2, False),
        "_5__rejected":   (3, False),
        "n_a":            None,
    },
    "What_is_the_average_urance_reimbursement": {     # MEDIUM
        "_30_days":   (1, False),
        "16_30_days": (2, False),
        "_15_days":   (3, False),
    },


    "What_is_the_average_ssue_resolution_time": {     # *HIGH (IT)
        "weeks___never_resolved": (1, True),
        "few_days":               (2, True),
        "same_day":               (3, True),
    },
    "What_is_the_average_ssue_resolution_time_001": { # MEDIUM (clinical)
        "weeks___never_resolved": (1, False),
        "few_days":               (2, False),
        "same_day":               (3, False),
    },
    "What_is_the_average_ssue_resolution_time_002": { # MEDIUM (HR)
        "weeks___never_resolved": (1, False),
        "few_days":               (2, False),
        "same_day":               (3, False),
    },
    "What_is_the_average_ssue_resolution_time_003": { # MEDIUM (infrastructure)
        "weeks___never_resolved": (1, False),
        "few_days":               (2, False),
        "same_day":               (3, False),
    },
    "Are_there_active_cha_port_used_routinely": {     # MEDIUM
        "none":                    (1, False),
        "exists_but_inconsistent": (2, False),
        "integrated_and_routine":  (3, False),
    },
    "What_is_the_impact_o_lth_service_delivery": {    # MEDIUM
        "high":   (1, False),
        "medium": (2, False),
        "low":    (3, False),
    },
}

# ── Domain question lists ────────────────────────────────────

DOMAIN_QUESTIONS: Dict[str, List[str]] = {
    "B_Governance": [
        "What_percentage_of_s_liant_with_HR_policy",
        "How_often_are_HR_aud_ion_visits_conducted",
        "Does_the_facility_have_an_esta",
        "Does_the_facility_act_on_feedback",
        "How_would_you_descri_digital_health_tools",
        "How_is_the_facility_perational_stability",
        "Has_this_facility_ex_tiatives_in_the_past",
        "How_many_supervision_includin",
        "What_percentage_of_a_ch_supervision_visit",
    ],
    "C_Workforce": [
        "What_percentage_of_s_in_the_last_12_month",
        "Do_clinicians_docume_ctly_in_digital_tool",
        "Is_there_a_dedicated_ble_at_this_facility",
        "Is_there_an_ongoing_g_programme_in_place",
    ],
    "D_Infrastructure": [
        "What_is_the_primary_power_sour",
        "What_backup_power_systems_are_",
        "Is_there_UPS_at_critical_workstations",
        "Is_there_a_potable_water_suppl",
        "Is_the_potable_water_supply_reliable",
        "Are_toilets_and_hand_t_key_points_of_care",
        "Network_latency_duri_umerator_ping_test",
        "Mobile_network_signal_strength",
        "What_proportion_of_e_ctional_Enumerator",
        "How_accurately_are_referrals_i",
        "Is_transport_availab_or_patient_referrals",
        "Does_the_facility_ha_oms_for_its_services",
        "How_compliant_is_the_ps_toilets_signage",
    ],
    "E_HealthInformation": [
        "What_is_the_main_method_used_f",
        "What_percentage_of_p_records_are_complete",
        "What_percentage_of_f_d_on_time_each_month",
        "What_is_the_average_tem_EMR_HIS_uptime",
        "Is_duplicate_entry_r_for_routine_services",
        "What_is_the_usual_ti_and_typical_backlog",
        "How_often_is_data_di_t_or_review_meetings",
        "Is_the_facility_acti_or_the_national_HIS",
        "Is_a_unique_client_ID_used_and",
        "What_is_the_primary_e_registration_point",
        "What_tool_do_clinicians_use_to",
        "Are_clinical_templat_during_documentation",
        "Are_login_credential_etween_staff_members",
        "How_are_lab_orders_captured",
        "How_are_lab_results_requesting_clinician",
        "Are_lab_records_link_ent_ID_in_the_system",
    ],
    "F_DigitalTech": [
        "Staff_enthusiasm_for_digitisation",
        "How_do_staff_perceiv_burden_or_valuable",
    ],
    "G_Clinical": [
        "What_is_the_clinical_ased_on_recent_audit",
        "What_percentage_of_t_in_system_functional",
        "Are_diagnostic_servi_red_at_this_facility",
        "Is_patient_flow_mapp_cross_service_points",
        "For_recent_PPH_cases_rted_after_diagnosis",
        "Are_children_6_59_mo_managed_per_protocol",
        "In_the_last_10_labou_nitored_per_protocol",
        "Among_OPD_adults_las_lled_BP_if_diagnosed",
    ],
    "H_SupplyChain": [
        "Average_stock_out_ra_tics_IV_fluids_etc",
        "How_often_is_stock_f_d_how_accurate_is_it",
        "Inventory_system_maturity",
    ],
    "I_Financing": [
        "How_frequently_are_f_how_are_they_created",
        "What_is_the_cadence_f_invoice_submission",
        "What_percentage_of_f_solved_within_7_days",
        "What_percentage_of_i_claims_are_rejected",
        "What_is_the_average_urance_reimbursement",
    ],
    "J_OperationalSupport": [
        "What_is_the_average_ssue_resolution_time",
        "What_is_the_average_ssue_resolution_time_001",
        "What_is_the_average_ssue_resolution_time_002",
        "What_is_the_average_ssue_resolution_time_003",
        "Are_there_active_cha_port_used_routinely",
        "What_is_the_impact_o_lth_service_delivery",
    ],
}


def _score_question(field: str, value: Optional[str]) -> Optional[tuple]:
    if field not in SCORE_MAP or not value:
        return None
    options = SCORE_MAP[field]
    entry = options.get(value)
    if entry is None:
        return None          # unknown value or explicit N/A exclusion
    points, is_high = entry
    valid_scores = [v[0] for v in options.values() if v is not None]
    max_points = max(valid_scores) if valid_scores else 0
    return points, max_points, is_high


def _score_domain(submission: Dict[str, Any], fields: List[str]) -> Optional[float]:
    earned = 0
    max_possible = 0
    for field in fields:
        result = _score_question(field, submission.get(field))
        if result is None:
            continue
        points, max_pts, is_high = result
        weight = 2 if is_high else 1
        earned += points * weight
        max_possible += max_pts * weight
    if max_possible == 0:
        return None
    
    return round((earned / max_possible) * 3, 2)


def _check_blockers(submission: Dict[str, Any]) -> List[str]:
    blockers = []

    if submission.get("What_is_the_primary_power_sour") == "none":
        blockers.append("No primary power source identified")

    if submission.get("What_backup_power_systems_are_") == "none":
        blockers.append("No backup power systems available")

    uptime = _safe_float(submission.get("Estimated_connectivi_verage_daily_uptime_"))
    if uptime is not None and uptime < 50:
        blockers.append(f"Internet uptime critically low ({uptime}%)")

    download = _safe_float(submission.get("Download_speed_in_Mb_n_speed_test_on_site"))
    if download is not None and download < 5:
        blockers.append(f"Download speed below 5 Mbps threshold ({download} Mbps)")

    upload = _safe_float(submission.get("Upload_speed_in_Mbps_n_speed_test_on_site"))
    if upload is not None and upload < 2:
        blockers.append(f"Upload speed below 2 Mbps threshold ({upload} Mbps)")

    if total_functional_devices(submission) == 0:
        blockers.append("No functional devices found (laptops, desktops, tablets, phones)")

    return blockers


def _tier(score: Optional[float], blockers: List[str]) -> str:
    """TRIBE-aligned readiness tiers (Part B5). Score is on 0–100 scale."""
    if blockers:
        return "Tier 3 — Not Deployment-Ready"
    if score is None:
        return "Incomplete"
    if score >= 75:
        return "Tier 1 — HOS-Ready"
    if score >= 55:
        return "Tier 2 — Deployment-Eligible"
    if score >= 35:
        return "Tier 2 — Structured Remediation"
    return "Critical Gaps"


def score_submission(submission: Dict[str, Any]) -> Dict[str, Any]:
    submission = normalize_kobo_submission(submission)
    domain_scores = {}
    for domain_key, fields in DOMAIN_QUESTIONS.items():
        score = _score_domain(submission, fields)
        domain_scores[domain_key] = {
            "label":         DOMAIN_LABELS.get(domain_key, domain_key),
            "score":         score,
            "tier":          _tier(score, []),
            "in_core_score": domain_key in CORE_DOMAINS,
        }

    core_scores = [
        domain_scores[d]["score"] for d in CORE_DOMAINS
        if domain_scores.get(d, {}).get("score") is not None
    ]
  
    if core_scores:
        domain_avg = sum(core_scores) / len(core_scores)
        overall_score = round((domain_avg / 3) * 100, 1)
    else:
        overall_score = None
    blockers = _check_blockers(submission)
    tier = _tier(overall_score, blockers)

    geo = submission.get("_geolocation")
    lat, lng = None, None
    if isinstance(geo, (list, tuple)) and len(geo) >= 2:
        lat, lng = float(geo[0]), float(geo[1])

    return {
        "submission_id":      submission.get("_id"),
        "submitted_at":       submission.get("_submission_time"),
        "facility_slug":      submission.get("Facility_name"),
        "facility_name":      display_label(submission.get("Facility_name")),
        "latitude":           lat,
        "longitude":          lng,
        "county":             display_label(submission.get("County")),
        "district":           display_label(
            submission.get("Heath_District") or submission.get("Health_District")
        ),
        "facility_type":      submission.get("Facility_type"),
        "operational":        submission.get("Is_this_facility_currently_operational"),
        "enumerator":         submission.get("_submitted_by"),
        "overall_score":      overall_score,
        "tier":               tier,
        "deployment_blocked": len(blockers) > 0,
        "blockers":           blockers,
        "domain_scores":      domain_scores,
        # Raw fields for display
        "download_mbps":      _safe_float(submission.get("Download_speed_in_Mb_n_speed_test_on_site")),
        "upload_mbps":        _safe_float(submission.get("Upload_speed_in_Mbps_n_speed_test_on_site")),
        "internet_uptime":    _safe_float(submission.get("Estimated_connectivi_verage_daily_uptime_")),
        "network_latency":    _extract_network_latency(submission),
        "primary_power":      submission.get("What_is_the_primary_power_sour"),
        "backup_power":       submission.get("What_backup_power_systems_are_"),
        "total_staff":        _safe_int(submission.get("Total_Number_of_Staff_Combined")),
        "daily_patients":     _safe_int(submission.get("Total_number_of_pati_ved_per_day_typical")),
        "laptops":            _safe_int(submission.get("Total_number_of_functional_laptops")),
        "desktops":           _safe_int(submission.get("Total_number_of_functional_desktops")),
        "tablets":            _safe_int(submission.get("Total_number_of_functional_tablets")),
        "phones":             _safe_int(submission.get("Total_number_of_functional_phones")),
        "routers":            _safe_int(submission.get("Total_number_of_functional_routers")),
        "access_points":      _safe_int(submission.get("Total_number_of_functional_access_points")),
        "digital_literacy_avg":          _safe_float(submission.get("Average_digital_lite_dom_sample_of_staff_")),
        "staff_without_supervision_pct": _safe_float(submission.get("What_percentage_of_s_without_supervision_")),
        "avg_registration_time":         _safe_float(submission.get("Average_registration_cutive_registrations")),
        "avg_consultation_time":         _safe_float(submission.get("Average_consultation_cutive_consultations")),
        "avg_lab_turnaround":            _safe_float(submission.get("Average_lab_result_t_minutes_Enumerator")),
        "supply_chain_in_scope": submission.get("Is_Inventory_Suppl_ope_for_this_project") == "yes",
        "photo_facility":     submission.get(FACILITY_PHOTO_FIELD),
        "photo_facility_attachment_uid": attachment_uid_for_basename(
            submission,
            submission.get(FACILITY_PHOTO_FIELD),
        ),
        "photo_power":        submission.get("Photo_of_primary_power_infrastructure"),
        "isp_provider":       submission.get("ISP_connectivity_provider_name"),
        # Extra raw fields for analytics aggregation
        "internet_type":      submission.get("Internet_availability_type_se"),
        "mobile_signal":      submission.get("Mobile_network_signal_strength"),
        "ups_coverage":       submission.get("Is_there_UPS_at_critical_workstations"),
        "recording_method":   submission.get("What_is_the_main_method_used_f"),
    }


def _safe_float(val) -> Optional[float]:
    try:
        return float(val) if val is not None else None
    except (ValueError, TypeError):
        return None


def _extract_network_latency(submission: Dict[str, Any]) -> Optional[str]:
    """Numeric ms from speed test, or categorical ping-test label."""
    for field in (
        "Network_latency_duri_n_speed_test_on_site",
        "Network_latency_duri_umerator_ping_test",
    ):
        raw = submission.get(field)
        if raw in (None, ""):
            continue
        numeric = _safe_float(raw)
        if numeric is not None:
            return f"{numeric:g} ms"
        return str(raw).replace("_", " ")
    return None


def _safe_int(val) -> Optional[int]:
    try:
        return int(float(val)) if val is not None else None
    except (ValueError, TypeError):
        return None


def aggregate_analytics(scored: list) -> Dict[str, Any]:
    internet_type_counts: Dict[str, int] = {}
    uptime_dist: Dict[str, int] = {"<50%": 0, "50-79%": 0, "80-94%": 0, "≥95%": 0}
    download_vals: List[float] = []
    upload_vals: List[float] = []

    primary_power_counts: Dict[str, int] = {}
    backup_power_counts: Dict[str, int] = {}
    ups_coverage_counts: Dict[str, int] = {}

    device_totals: Dict[str, int] = {"laptops": 0, "desktops": 0, "tablets": 0, "phones": 0}
    facilities_with_devices = 0

    recording_method_counts: Dict[str, int] = {}
    county_counts: Dict[str, int] = {}
    near_threshold: List[Dict[str, Any]] = []

    for s in scored:
        it = s.get("internet_type")
        if it:
            internet_type_counts[it] = internet_type_counts.get(it, 0) + 1

        uptime = s.get("internet_uptime")
        if uptime is not None:
            if uptime < 50:
                uptime_dist["<50%"] += 1
            elif uptime < 80:
                uptime_dist["50-79%"] += 1
            elif uptime < 95:
                uptime_dist["80-94%"] += 1
            else:
                uptime_dist["≥95%"] += 1

        dl = s.get("download_mbps")
        ul = s.get("upload_mbps")
        if dl is not None:
            download_vals.append(dl)
        if ul is not None:
            upload_vals.append(ul)

        pp = s.get("primary_power")
        if pp:
            primary_power_counts[pp] = primary_power_counts.get(pp, 0) + 1
        bp = s.get("backup_power")
        if bp:
            backup_power_counts[bp] = backup_power_counts.get(bp, 0) + 1
        ups = s.get("ups_coverage")
        if ups:
            ups_coverage_counts[ups] = ups_coverage_counts.get(ups, 0) + 1

        any_device = False
        for field in ["laptops", "desktops", "tablets", "phones"]:
            val = s.get(field)
            if val is not None and val > 0:
                device_totals[field] += val
                any_device = True
        if any_device:
            facilities_with_devices += 1

        rm = s.get("recording_method")
        if rm:
            recording_method_counts[rm] = recording_method_counts.get(rm, 0) + 1

        county = s.get("county") or "Unknown"
        county_counts[county] = county_counts.get(county, 0) + 1

        score = s.get("overall_score")
        tier = s.get("tier")
        if score is not None and tier in ("Not Ready", "Foundational"):
            if tier == "Not Ready" and score >= 55:
                near_threshold.append({
                    "facility_name": s.get("facility_name"),
                    "county": s.get("county"),
                    "overall_score": score,
                    "tier": tier,
                    "points_to_next": round(60 - score, 1),
                    "next_tier": "Foundational",
                    "submission_id": s.get("submission_id"),
                })
            elif tier == "Foundational" and score >= 75:
                near_threshold.append({
                    "facility_name": s.get("facility_name"),
                    "county": s.get("county"),
                    "overall_score": score,
                    "tier": tier,
                    "points_to_next": round(80 - score, 1),
                    "next_tier": "Deployment Ready",
                    "submission_id": s.get("submission_id"),
                })

    near_threshold.sort(key=lambda x: x["points_to_next"])

    n = len(scored)
    return {
        "connectivity": {
            "internet_type_distribution": [{"label": k, "count": v} for k, v in internet_type_counts.items()],
            "uptime_distribution": [{"label": k, "count": v} for k, v in uptime_dist.items()],
            "avg_download_mbps": round(sum(download_vals) / len(download_vals), 1) if download_vals else None,
            "avg_upload_mbps":   round(sum(upload_vals) / len(upload_vals), 1) if upload_vals else None,
            "facilities_with_data": len(download_vals),
        },
        "power": {
            "primary_power_distribution":  [{"label": k, "count": v} for k, v in primary_power_counts.items()],
            "backup_power_distribution":   [{"label": k, "count": v} for k, v in backup_power_counts.items()],
            "ups_coverage_distribution":   [{"label": k, "count": v} for k, v in ups_coverage_counts.items()],
        },
        "devices": {
            "totals": device_totals,
            "facilities_with_devices": facilities_with_devices,
            "avg_per_facility": {
                k: round(v / facilities_with_devices, 1)
                for k, v in device_totals.items()
            } if facilities_with_devices else {k: 0.0 for k in device_totals},
        },
        "progress": {
            "county_submissions": [{"county": k, "submitted": v} for k, v in sorted(county_counts.items())],
            "near_threshold": near_threshold[:10],
            "recording_methods": [{"label": k, "count": v} for k, v in recording_method_counts.items()],
            "total_submissions": n,
            "total_facilities": PROGRAMME_FACILITY_TARGET,
        },
    }


def score_all(submissions: list) -> list:
    return [score_submission(s) for s in submissions]


def aggregate_summary(scored: list) -> Dict[str, Any]:
    total = len(scored)
    if total == 0:
        return {
            "total_submissions": 0, "total_facilities": PROGRAMME_FACILITY_TARGET,
            "completion_pct": 0, "avg_score": None,
            "tier_counts": {}, "blocked_count": 0, "by_county": [],
        }

    tier_counts: Dict[str, int] = {}
    blocked_count = 0
    scores = []
    by_county: Dict[str, Dict] = {}

    for s in scored:
        tier = s.get("tier", "Incomplete")
        tier_counts[tier] = tier_counts.get(tier, 0) + 1
        if s.get("deployment_blocked"):
            blocked_count += 1
        if s.get("overall_score") is not None:
            scores.append(s["overall_score"])
        county = s.get("county") or "Unknown"
        if county not in by_county:
            by_county[county] = {"county": county, "total": 0, "tiers": {}}
        by_county[county]["total"] += 1
        by_county[county]["tiers"][tier] = by_county[county]["tiers"].get(tier, 0) + 1

    return {
        "total_submissions": total,
        "total_facilities": PROGRAMME_FACILITY_TARGET,
        "completion_pct": round((total / PROGRAMME_FACILITY_TARGET) * 100, 1),
        "avg_score":         round(sum(scores) / len(scores), 1) if scores else None,
        "tier_counts":       tier_counts,
        "blocked_count":     blocked_count,
        "by_county":         list(by_county.values()),
    }
