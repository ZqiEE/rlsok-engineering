# RLSOK

### Give your AI a real engineering workbench.

**[Explore the English preview](https://rlsok.com) · [Get started](https://rlsok.com/start.html) · [Download the evidence viewer](https://rlsok.com/downloads/rlsok-evidence-preview.zip)**

RLSOK is a general AI engineering R&D platform in development. Bring an external
AI agent, real design files, operating conditions, and numerical acceptance
criteria. RLSOK connects mature engineering tools to versioned results and
inspectable evidence.

**Idea → design → actual tool execution → numerical feedback → revision → verification → scoped engineering files.**

External AI supplies engineering reasoning. RLSOK supplies the engineering
interface, design identity, resource controls, native tool receipts, and evidence.
The platform is not limited to robots, GPUs, or a single CAD program.

## Inspect real results

| Experiment | Recorded result | Validated scope |
| --- | --- | --- |
| RC circuit · ngspice | Resistance 10 kΩ → 1 kΩ; voltage at 5 ms 1.967 V FAIL → 4.966 V PASS | One ideal RC transient; no physical PCB claim |
| Motor + joint · ngspice / MuJoCo | Driver resistance 47 Ω → 4.7 Ω; final angle 0.493 rad and current 0.436 A | Sourced motor, ideal direct drive, finite coupling checks |
| GPU design · Vortex-derived RTL | Holdout score 1.0348× project baseline; 184 output checks passed | Simulation cycles; not an NVIDIA rating or manufactured GPU |

Initial failures, actual design changes, exact values, and provenance hashes are
available in the preview. Original tool success and scoped engineering acceptance
are distinct. A previous PASS does not validate an arbitrary new design.

## Try it

1. Open [rlsok.com](https://rlsok.com) and switch between the recorded experiments.
2. Download `rlsok-evidence-preview.zip`, extract it, and open `index.html` locally.
3. Inspect the evidence JSON extracts and declared limits.

The evidence viewer works in a modern desktop or mobile browser without an
account. It does **not** include native solvers or run live physics in the browser.

## Downloads

Installers and large files are published as [GitHub Releases](https://github.com/ZqiEE/rlsok-engineering/releases),
each with a `SHA256SUMS.txt`. Check the hash before running anything:

```
Get-FileHash .\RLSOK-0.1.5-windows-x64.zip
```

| Release | File | Contents |
| --- | --- | --- |
| `v0.1.5` | `RLSOK-0.1.5-windows-x64.zip` | Windows desktop app (not code-signed yet) |
| `cad-addon-1` | `RLSOK-cad-addon-1-win64.zip` | Optional CAD add-on (build123d / OCP), installed from inside the app |
| `bird-r1` | `RLSOK-bird-R1-build-package.zip` | Bionic bird R1: parts list with reference prices, print files, templates, flight parameters. **Simulation only, unverified** |

## Website source and deployment

`site/` is the exact static website served at rlsok.com (HTML/CSS/JS, media, evidence extracts).
`site/RELEASE.sha256` lists every file. Pushing a tag named `site-YYYYMMDD.N` publishes it:
the server checks GitHub every 5 minutes, verifies the files, switches atomically and rolls back on
failure. See [deploy/README.md](deploy/README.md). Secrets and files over 10 MB are blocked by
`tools/scan_secrets.py` (enable with `git config core.hooksPath .githooks`).

## Capability boundaries

Scoped engineering work includes ideal electrical transients, a motor/joint
example, finite frictionless contact, ideal continuous servo control, simplified
Stokes air forces, and GPU RTL experiments. Model assumptions matter.

Gmsh + CalculiX structure/solid heat native qualification is **NOT_RUN**. Detailed
CFD, manufacturing tolerances, uncertainty analysis, and preCICE coupling remain
unvalidated. Installation alone never establishes a usable engineering capability.
See [CAPABILITIES.md](CAPABILITIES.md) and [ROADMAP.md](ROADMAP.md).

## Share a use case

Open an [issue](https://github.com/ZqiEE/rlsok-engineering/issues) with the product
you want to design, relevant files, units, operating conditions, numerical targets,
and expected deliverable format. Do not upload credentials or confidential files.

## Credits

RLSOK reuses mature tools instead of rewriting solvers. MuJoCo, ngspice, Vortex,
Gmsh, CalculiX, OpenFOAM, OpenTURNS, and preCICE are independent projects with
their own licenses. Referencing a tool does not imply endorsement. No solver is
stored in this repository.
