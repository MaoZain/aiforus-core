# Upstream Maintenance

OpenMAIC updates are reviewed, not synchronized.

For each candidate:

1. select and record one exact upstream commit;
2. verify the license at that commit before importing code;
3. compare only the relevant DSL, renderer behavior, prompts, and fixes;
4. classify every change as required, optional, application-only, or rejected;
5. work on `upstream-sync/<date-or-version>`;
6. update `UPSTREAM.md`, `NOTICE`, and `THIRD_PARTY_NOTICES.md`;
7. import selected changes manually;
8. add serialized-data migrations when needed;
9. run compatibility, visual, license, package, and clean-consumer checks;
10. release using independent AIForUs SemVer and release notes.

If a future upstream revision has unacceptable licensing or architecture, do
not import it. Continue maintaining the frozen MIT baseline independently.
