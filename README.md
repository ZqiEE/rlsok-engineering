# RLSOK

### Describe an idea. Your own AI designs it with real engineering tools. You get files you can build.

**[rlsok.com](https://rlsok.com) · [Download for Windows](https://rlsok.com/download/) · [Evidence](https://rlsok.com/evidence/) · [Log](https://rlsok.com/log/)**

RLSOK is a free, general-purpose engineering workbench for AI. You describe what
you want to make. Your own AI (Claude, Codex, any API model, or copy-paste into a
chat) writes the design. RLSOK runs it through real solvers, checks it against
criteria that are frozen before the run, sends the numbers back to the AI to
revise, and hands you the deliverables: parts list, print files, netlists,
controller parameters and a report.

- **Free.** No account, no sign-in, no purchase routing.
- **Runs on your computer.** Your CPU or your own NVIDIA GPU; your AI, your keys.
- **Honest results.** Every result carries one of four states, and every number
  links to the run that produced it.

The goal: a design that passes in RLSOK should have the best possible chance of
working the first time you build it. We are not there yet. See
[what works today](#what-works-today) and [CAPABILITIES.md](CAPABILITIES.md).

## Result states

| State | Meaning |
| --- | --- |
| **Verified on real hardware** | A physical build was measured against the pre-registered criteria |
| **Simulation pass, not verified on hardware** | Passed every frozen check in simulation; nothing has been built or measured yet |
| **In progress** | Running, or waiting for data |
| **Did not pass** | Failed a frozen check. Failures stay published |

No result is "Verified on real hardware" today.

## What works today

| Area | What RLSOK does | State |
| --- | --- | --- |
| Circuits (ngspice) | AI writes a netlist; ngspice runs it; nominal, corner, Monte Carlo and load-step checks; BOM and report | Simulation pass, not verified on hardware. Designs with ideal sources are marked "ideal simulation only" |
| Flapping-wing bird (R2) | AI designs body and wings in code; CAD runs in a sandbox; parts and reference prices; weight and energy budget; 24-run mission simulation; build package | Simulation pass, not verified on hardware. The wing aerodynamics model **did not pass** its pre-registered check, and pitch dynamics are an assumed lag (see [CAPABILITIES.md](CAPABILITIES.md)) |
| Legged robots (MuJoCo) | Runs existing walking policies, with domain randomisation, motor and thermal models | Engine matches the upstream code for a small open-source biped (bit-identical) and Unitree G1 (statistical). No legged design loop yet |
| Policy training (JAX / brax, WSL2 + NVIDIA GPU) | Retrains a biped policy and checks it against pre-registered tracking limits | 300M-step retrain passed; the earlier 150M run did not. G1 training not run |

The bird is the current main line. R2 has a written hardware build and test
guide with criteria frozen in advance; the first airflow-stand test is the next
step that can make any claim real.

## Try it

1. Download `RLSOK-0.2.0-windows-x64.zip` from [Releases](https://github.com/ZqiEE/rlsok-engineering/releases/tag/v0.2.0)
   and check its SHA256 (listed in `SHA256SUMS.txt` and on the download page):
   ```
   Get-FileHash .\RLSOK-0.2.0-windows-x64.zip
   ```
2. Extract it and run `install.cmd`. It installs for your user only; no admin rights needed.
3. Open RLSOK and choose one of the three examples (bird, 12 V→5 V power supply,
   walking robot) to see a finished result. Then connect your AI and start your own.

Requirements: Windows 10/11 64-bit. Circuits and the bird run on CPU. Policy
training needs WSL2 and an NVIDIA GPU (tested on a 4 GB GTX 1650 Ti).

The app is **not code-signed yet**. SmartScreen will warn you, and Windows 11
Smart App Control blocks unsigned programs and can stop the physics engines.
RLSOK does not bypass either.

## Downloads

Large files are [GitHub Releases](https://github.com/ZqiEE/rlsok-engineering/releases), each with `SHA256SUMS.txt`.

| Release | File | Contents |
| --- | --- | --- |
| `v0.2.0` | `RLSOK-0.2.0-windows-x64.zip` | Windows app |
| `cad-addon-1` | `RLSOK-cad-addon-1-win64.zip` | Optional CAD add-on (build123d / OCP), installed from inside the app |
| `bird-r2-3` | `RLSOK-bird-R2-build-package.zip` | Bird R2: parts list with reference prices, print files, flight parameters, build and test guide. **Simulation pass, not verified on hardware** |

## Share a use case

Open an [issue](https://github.com/ZqiEE/rlsok-engineering/issues) with what you
want to make: units, operating conditions, numerical targets and the deliverables
you need. Do not upload credentials or confidential files.

## This repository

`site/` is the exact static site served at rlsok.com, with `site/RELEASE.sha256`
listing every file. Pushing a tag named `site-YYYYMMDD.N` publishes it: the
server checks GitHub every 5 minutes, verifies the files, switches atomically and
rolls back on failure ([deploy/README.md](deploy/README.md)). `tools/scan_secrets.py`
blocks secrets and files over 10 MB (`git config core.hooksPath .githooks`).

## Credits

RLSOK connects mature tools instead of rewriting them: ngspice, MuJoCo, JAX/brax
and MuJoCo Playground, mjlab, build123d/OCP, and PteraSoftware (for
cross-checks). They are independent projects under their own licences;
referencing them does not imply endorsement. No solver is stored in this
repository.
