# Shared report contract

`report.ts` is browser/native-safe TypeScript. It implements the proposed [data fields](../docs/data-contract.md), issue labels, synthetic poles, local demo record creation, and duplicate filtering. It contains no provider credentials or server code.

`ReportInput` is the integration input. `DemoReport` is only a local preview record. Server-owned IDs, timestamps, ownership and delivery still require Person 4's API. `DemoReportStore` exposes list/save to the two local adapters and must not be mistaken for the production API contract.
