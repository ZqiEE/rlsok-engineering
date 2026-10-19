# Current engineering scope

Status describes existing evidence, not automatic acceptance of new designs.

| Domain | Existing evidence | Limits / remaining work |
| --- | --- | --- |
| Electrical | Actual ngspice ideal RC transients; numerical FAIL, AI revision, new run and scoped PASS | No general PCB, EMC, power electronics, or physical-board qualification |
| Electromechanical | ngspice current and back EMF exchanged with MuJoCo torque and joint speed; sourced motor example | Ideal direct drive; no full robot, friction, thermal, strength or hardware qualification |
| Contact | Finite rigid-body frictionless contact with qualified PGS numerical recipe and parameter checks | Qualified model and timestep range only; historical failures retained |
| Control | Ideal continuous servo reference cases and parameter contrasts | No general sampled controller, sensor, delay, robustness or hardware qualification |
| Air | Isolated low-Reynolds-number Stokes sphere and viscosity/wind contrasts | Simplified forces; no resolved flow field or detailed CFD |
| GPU | Vortex-derived RTL revisions; frozen regression and separate holdout | Simulation benchmark evidence; no commercial GPU equivalence, full-chip PPA or manufactured chip |
| Structure / solid heat | Gmsh + CalculiX adapter and reference-case preparation | Native qualification NOT_RUN; displacement/stress/temperature/heat flow not yet accepted |
| Detailed flow | OpenFOAM selected | Unvalidated |
| Parameter uncertainty / tolerances | OpenTURNS route selected | Unvalidated; needs parameter distributions and physical reference cases |
| Coupling | Existing finite motor/joint exchange example | General preCICE/official adapter path unvalidated |

The public evidence JSON files are curated extracts with provenance hashes, not
complete native traces. Engineering manufacturing readiness requires additional
geometry, materials, loads, interfaces, tolerances, verification and physical
validation appropriate to each product.
