# Database and storage plan

**Owner:** Person 4; Person 5 reviews uploads. **Status:** documentation placeholder; implementation pending.

## Purpose

Database schema, ownership policies, private image storage configuration, and sample seed setup.

## Planned contents

migrations/ plus future configuration and reproducible sample seed.

## Working rules

Start with poles, reports, report_status_events, and upload tracking. Enforce session ownership; validate policies with two sessions before public preview.

Use the [team guides](../docs/README.md) for dependencies, acceptance criteria, and workflow, and the [shared contract](../docs/data-contract.md) for field definitions. Update this folder guide with actual entry points and verified commands as code is added.
