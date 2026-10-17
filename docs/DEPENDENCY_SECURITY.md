# Dependency security review — 17/10/2026

Production audit: `cd website && npm audit --omit=dev` reports zero advisories after updating Next.js / eslint-config-next to 16.4.2, sharp to 0.35.5 (through Next), and source-map-js to 1.2.2. Removed unused gray-matter, remark, remark-html and shadcn CLI dependencies; generated UI components remain in source. The website CI enforces production audit at moderate or higher severity.

References: [Next.js 16.4.2](https://github.com/vercel/next.js/releases/tag/v16.4.2), [Next.js SSRF advisory](https://github.com/advisories/GHSA-cjq9-62q9-8jv4), [sharp advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w), [source-map-js advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q). The static export uses unoptimized images; the audit findings do not by themselves establish exploitation of this deployment.

## Remaining development-only advisory

Full `npm audit` reports five affected package entries for one underlying [braces advisory, GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). As of this review there is no patched release. Dependency path: eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces@3.0.3. All five entries are development dependencies; none appears in the production audit.

The issue requires a caller to supply deeply nested brace patterns. In the installed Next ESLint plugin, fast-glob is used by `dist/utils/get-root-dirs.js` only for a configured `settings.next.rootDir`. This repository does not configure that setting: the plugin uses `context.cwd` directly. The lint command and configuration are maintained in the repository; browser/community content is never used as a glob. This unused code path is not treated as a merge blocker. Do not enable rootDir globs from untrusted input. Revisit this assessment when updating ESLint config or when a patched braces release becomes available.

Keep lint enabled and Next/eslint-config-next aligned. Do not force the audit suggestion to downgrade to eslint-config-next 14 merely to remove the warning count. This is a documented residual development dependency issue, not a claim that the full audit is clean.
