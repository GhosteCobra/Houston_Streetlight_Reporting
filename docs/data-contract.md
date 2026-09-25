# Shared data contract

**Owner:** Person 4, reviewed by Persons 2, 3, and 5. **Version:** proposed v1; implement schemas in `src/lib/schemas/` before integrating modules. Changes require a coordinated PR.

## Pole

| Field | Type / rule |
| --- | --- |
| pole_id | Nonempty stable string; synthetic values use DEMO- prefix |
| latitude / longitude | Finite WGS84 numbers in [-90,90] / [-180,180] |
| address | String or null; a nearby address is not proof of ownership |
| status | working, reported, damaged, unknown; default unknown |
| provider | String or null; do not infer ownership from coordinates alone |
| source | Dataset identifier; provenance recorded in data guide |

ArcGIS object IDs must be mapped explicitly, not mistaken for physical pole numbers. GeoJSON geometry uses [longitude, latitude].

## Report creation input

| Field | Type / rule |
| --- | --- |
| pole_id | String or null; if supplied, validate against available pole data |
| latitude / longitude | Required finite WGS84 coordinates |
| location_source | gps or manual |
| location_confirmed | Must be true before submission |
| location_accuracy_m | Nonnegative number or null; manual coordinates use null |
| captured_at | UTC ISO timestamp or null; do not invent capture time for existing images |
| address | String or null; proposed maximum 300 characters |
| issue_type | light_out, flickering, pole_damaged, pole_leaning, exposed_wires, other |
| description | Optional string, proposed maximum 2,000 characters |
| photo_path | Null or server-issued, validated storage object reference |

Proposed creation example (synthetic):

```json
{
  "pole_id": "DEMO-104522",
  "latitude": 29.7604,
  "longitude": -95.3698,
  "location_source": "manual",
  "location_confirmed": true,
  "location_accuracy_m": null,
  "captured_at": null,
  "address": "Houston, TX",
  "issue_type": "light_out",
  "description": "Synthetic demo report",
  "photo_path": null
}
```

## Server-owned fields

Generate `report_id`, `owner_id`, and UTC `reported_at` on the server. Set `status=submitted` on creation. Record `provider_delivery_status=not_sent` for the demo. Reject client attempts to set these fields.

`severity` remains nullable until the team agrees on a rule; the README’s medium value is illustrative, not a classifier. Keep emergency messaging separate from any unverified severity estimate.

Draft state is local for MVP. Persisted status progression is submitted → under_review → assigned → repaired, with authorized team actors only. These are demo states. A status event contains report ID, old/new status, actor ID, and server timestamp.

## Storage and access

Report owners can retrieve their own records; admin access requires an explicit trusted role. Do not expose a public report list containing photos or precise resident data. Store object paths, not signed URLs; mint short-lived links only after authorization. Session ownership must be enforced by database/storage policies and server checks.
