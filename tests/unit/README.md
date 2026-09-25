# Unit checks

**Owner:** Each feature owner. **Status:** exporter tests available; application tests pending.

## Purpose

Schema boundaries, pole matching, duplicate rules, and isolated logic.

## Planned contents

Future Vitest test files with deterministic fixtures.

## Working rules

Test observable behavior and edge cases, not copies of implementation. No network or production credentials.

Use the [team guides](../../docs/README.md) for dependencies, acceptance criteria, and workflow, and the [shared contract](../../docs/data-contract.md) for field definitions. Update this folder guide with actual entry points and verified commands as code is added.

## Exporter acceptance tests

[test_streetlight_export.py](test_streetlight_export.py) tests the supplied Python exporter with synthetic responses and temporary outputs. With Python and requests available, run `python -X utf8 -m unittest discover -s tests/unit -p test_streetlight_export.py -v` from the repository root. All 18 exporter acceptance tests pass; see the [test report](../../docs/streetlight-export-test-report.md). No network access is used by these tests.
