# What RLSOK can and cannot do (0.2.0, October 2026)

States: **Verified on real hardware** · **Simulation pass, not verified on hardware** ·
**In progress** · **Did not pass**. Every check below was registered before the run
it judges. A previous pass does not validate a new design.

## Summary

| Capability | Solver | State | Main limits |
| --- | --- | --- | --- |
| Circuit design loop | ngspice | Simulation pass, not verified on hardware | Tolerances vary R, L and C only; no vendor device models; switching ripple and efficiency depend on the ngspice version; no PCB, EMC or physical board |
| Bird: wing forces, DelFly-type X-wing | RLSOK quasi-steady blade-element model | Passed on held-out public flight data | Only X-wings at 11–15 Hz and 0.25–1.4 m/s; cycle-averaged forces; coefficients are fitted, not physical |
| Bird: wing forces, two-wing (bird-like) | RLSOK model F (DeLaurier + stroke-plane tilt + Polhamus vortex lift) | **Did not pass** | Held-out E-Flap flights: frequency error 7.8 % (pass); UVLM cross-check pass; SmartBird point 31.6 % off, 1.6 points over the limit, so the whole check fails. No unused E-Flap data is left |
| Bird: pitch/attitude dynamics | none (assumed first-order lag) | **Did not pass** (6 attempts) | Public free-flight data cannot pin down pitch dynamics. The mission simulation sweeps the lag from 0.2 to 5 s instead |
| Bird: design loop and mission | RLSOK point-mass flight model, PX4-style controller | Simulation pass, not verified on hardware | R2 passes 11/11 design checks and 24/24 mission runs, built on the two rows above |
| Bird: CAD and parts | build123d / OCP (sandboxed) | Works | Mass and inertia from CAD; prices are dated references, not quotes; no strength analysis |
| Legged robots: engine consistency | MuJoCo (CPU) | Matches upstream | Small open-source biped bit-identical to the upstream loop on the same platform; Unitree G1 statistical match with mjlab. Official policies, flat ground, nominal model |
| Legged robots: training reproduction | JAX / brax PPO on WSL2 + NVIDIA GPU | Biped: pass at 300M steps (150M did not pass). G1: not run | G1 needs about 24 h on a GTX 1650 Ti. No legged design loop |
| Motor heating | RLSOK first-order thermal model | Assumed parameters | Relative heating only until you upload a measured temperature log; G1 has no motor model |

## Not in RLSOK today

- Structural strength or fatigue (no FEA has been run)
- Detailed CFD; the bird uses reduced-order aerodynamics
- Manufacturing tolerance analysis outside circuits
- Any physical build or measurement of an RLSOK design
- macOS and Linux apps (Linux is used only through WSL2 for training)

## Where the evidence is

- Public extracts: [rlsok.com/evidence](https://rlsok.com/evidence/), with provenance hashes
- Each release's build package includes its criteria and mission results
- Pre-registered criteria are JSON files frozen before the run; failed attempts are kept

The older ATOMS-era experiments (GPU RTL, a frictionless contact recipe, a Stokes
air-drag case, a motor/joint co-simulation) remain on the
[legacy page](https://rlsok.com/legacy.html) and are no longer developed.
