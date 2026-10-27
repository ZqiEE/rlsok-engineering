# Roadmap

RLSOK's promise: a design that passes in RLSOK should have the best possible
chance of working the first time you build it. The roadmap is ordered by what
gets us closest to that. Dates are not promised.

## Now

1. **First real measurement.** Build bird R2 and run the airflow-stand test registered in
   advance: vertical force 2.53–4.21 N at 7 m/s and 1.55 Hz. Publish the result,
   pass or fail.
2. **Shorter first run.** Go from download to a finished example in a few minutes, with clear
   setup for your own AI (command-line tool, API key or copy-paste) and plain
   explanations for every place a new install can get stuck.

## Next

3. **Robust PASS.** Every pass criterion also checks margins, material and
   manufacturing variation, and environment ranges, not just nominal values.
4. **Readiness in plain language.** Every result shows how close it is to working in
   real life and its main remaining risks.
5. **Fix or downgrade the weak models.** The two-wing aerodynamics model and the
   assumed pitch dynamics (see [CAPABILITIES.md](CAPABILITIES.md)).

## Later

6. **"I built it" reports.** You record what happened (worked, partly worked or
   failed, plus measurements, photos and notes) in a local file tied to the design
   version. Sharing it is a separate choice you make; nothing is sent automatically.
7. **Portable project bundle.** Idea, design files, criteria, results, evidence and
   hashes in one file that another person can open and rerun. This is the
   foundation for a future sharing hub.

## Future, not started

- Structural analysis (Gmsh + CalculiX), detailed CFD (OpenFOAM), uncertainty
  analysis (OpenTURNS) and multi-solver coupling (preCICE). These were planned in
  the ATOMS era. They are not being worked on now, and each would have to pass
  reference cases before RLSOK uses it.
- Legged-robot design loop and Unitree G1 training reproduction.
- Code signing, and macOS and Linux apps.
