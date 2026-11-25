# M5-C isolated Linux preparation — approval request

The accepted M5-B source fingerprint and 39-file inventory are unchanged, with zero staged files. Existing Ubuntu WSL2 reports Linux x86_64, Ubuntu 26.04.1 and glibc 2.43. No Linux node executable is on PATH; the discovered npm points to Windows and will not be reused as a Linux installation.

Proposed destination: **Ubuntu `/tmp/yarc-create-m5c-e52a30ea813e`**, containing only a temporary `app` build copy, local `toolchain`, download records and private build cache. This is disposable preparation, not another active Git repository. The directory must not already exist; no deletion or overwrite of an existing directory is authorized. Source is copied by an exact hash-checked allowlist: src, public, tests/evaluation TypeScript required by the existing tsconfig, package.json, package-lock.json, next.config.ts, tsconfig.json, lint/Playwright config and necessary public license texts. No .git, .env.local, real credentials, node_modules, .next, test-results, OneDrive files or private historical records are copied. The accepted Windows workspace and lockfile remain unchanged.

Request permission for the following Linux operations (only after approval):

```sh
set -eu
prep=/tmp/yarc-create-m5c-e52a30ea813e
test ! -e "$prep"
mkdir -p "$prep/downloads" "$prep/toolchain" "$prep/app" "$prep/npm-cache"
# Hash-checked allowlist copy into app using existing Python 3; no Git/env/history.
curl --fail --silent --show-error --proto '=https' --tlsv1.2 \
  https://nodejs.org/dist/v24.22.3/SHASUMS256.txt \
  --output "$prep/downloads/SHASUMS256.txt"
curl --fail --silent --show-error --proto '=https' --tlsv1.2 \
  https://nodejs.org/dist/v24.22.3/node-v24.22.3-linux-x64.tar.xz \
  --output "$prep/downloads/node-v24.22.3-linux-x64.tar.xz"
cd "$prep/downloads"
grep '  node-v24.22.3-linux-x64.tar.xz$' SHASUMS256.txt | sha256sum --check --strict
tar -xJf node-v24.22.3-linux-x64.tar.xz -C "$prep/toolchain" --strip-components=1
export PATH="$prep/toolchain/bin:/usr/bin:/bin"
export GEMINI_ENABLED=false NEXT_TELEMETRY_DISABLED=1 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
unset GEMINI_API_KEY NODE_OPTIONS
cd "$prep/app"
npm ci --ignore-scripts --include=dev --no-audit --no-fund \
  --registry=https://registry.npmjs.org --cache="$prep/npm-cache"
npm run build
```

Node 24.22.3 matches the existing Windows verification major/patch; the official release index lists a Linux x64 archive and bundled npm 11.19.1. Checksum verification is against the official HTTPS manifest; no unverified archive executes. Failure to obtain or validate that exact archive stops this path; no substitute version/toolchain is authorized implicitly. Vercel supports Node 24.x but chooses minor/patch itself, so this preparation does not prove its exact build/function version.

Expected network: HTTPS downloads from nodejs.org for the pinned Linux Node archive and checksum manifest, then registry.npmjs.org for the existing integrity-locked dependency graph and selected Linux optional packages. No new dependency/version, install scripts, global tools, Docker, distro or browser installation. Locked package URLs all use registry.npmjs.org. Build telemetry is disabled; a missing native dependency/fallback download requirement must be reported rather than silently acquiring another tool or package. Registry transfer size depends on cache/platform selection and is not asserted as an exact number.

Purpose: actual Linux build/traces and exact installed Linux Sharp/libvips/SWC/client-only/vendor notice inspection. Allowed focused checks may import existing native modules and test returned HTML with inference disabled. No provider call, deployment, Vercel project creation, Git mutation or archive change follows from this permission.

This explicit approval gate comes from section 2 of the owner-approved M5-C brief: “If a Linux dependency installation, external download or additional tool installation is needed, first report the exact proposed commands, destination, expected network activity and purpose, and request narrowly scoped approval.” Independent read-only privacy/licensing work continues while permission is pending.
