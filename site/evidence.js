window.RLSOK_EVIDENCE = {
  "circuit": {
    "tool": "NGSPICE / TRANSIENT ANALYSIS",
    "title": "An RC circuit that missed its target.",
    "description": "At 5 ms, the first design charged too slowly. The external AI read the failure, changed one component, and ran a new design version.",
    "beforeLabel": "INITIAL DESIGN · 10 kΩ",
    "beforeValue": "1.967 V",
    "beforeStatus": "FAIL · BELOW TARGET",
    "afterLabel": "REVISED DESIGN · 1 kΩ",
    "afterValue": "4.966 V",
    "afterStatus": "PASS · SAME TARGET",
    "change": "Changed: charging resistance 10 kΩ → 1 kΩ. Real ngspice rerun.",
    "target": "Output ≥ 4.9 V at 5 ms; current ≤ 6 mA.",
    "scope": "A real failure-to-revision loop for one ideal RC circuit. No physical board or manufacturing claim.",
    "widths": [
      39.34693162738896,
      99.32621196968178
    ]
  },
  "motor": {
    "tool": "NGSPICE + MUJOCO / COUPLED EXAMPLE",
    "title": "A motor-drive revision that moved the joint.",
    "description": "A sourced motor model exchanges current, torque, speed, and back EMF between two actual tools. The final design met the frozen angle and current targets.",
    "beforeLabel": "INITIAL EXCHANGE · 47 Ω",
    "beforeValue": "0.071 rad",
    "beforeStatus": "FAIL · INITIAL GUESS",
    "afterLabel": "REVISED + CHECKED · 4.7 Ω",
    "afterValue": "0.493 rad",
    "afterStatus": "PASS · COUPLED CHECKS",
    "change": "Changed: driver resistance 47 Ω → 4.7 Ω. Final current: 0.436 A.",
    "target": "Angle ≥ 0.25 rad at 0.1 s; |current| ≤ 0.5 A; frozen exchange residual limits.",
    "scope": "One ideal direct-drive motor and disk. Initial exchange was not converged. No complete robot or hardware qualification.",
    "widths": [
      14.153580871547597,
      98.54602689475168
    ]
  },
  "gpu": {
    "tool": "VORTEX-DERIVED GPU / FROZEN HOLDOUT",
    "title": "A GPU design change with measurable results.",
    "description": "The revised design passed the frozen development regression and a separate holdout. The score comes from RTL simulation cycles against the project baseline.",
    "beforeLabel": "FROZEN PROJECT BASELINE",
    "beforeValue": "1.000×",
    "beforeStatus": "REFERENCE",
    "afterLabel": "REVISED GPU DESIGN",
    "afterValue": "1.035×",
    "afterStatus": "HOLDOUT PASS · 184 CHECKS",
    "change": "Measured geometric cycle speedup: 3.48%. Some cases were slightly slower.",
    "target": "Frozen numerical correctness and per-case regression limits; independently checked.",
    "scope": "Simulation benchmark improvement. No NVIDIA-equivalent rating, full-chip PPA, or manufactured-GPU claim.",
    "widths": [
      96,
      100
    ]
  },
  "robot": {
    "labels": [
      {
        "key": "level1",
        "name_en": "Level 1 · engine + official policy",
        "name_zh": "第一级 · 引擎 + 官方策略",
        "label": {
          "status": "VERIFIED",
          "zh": "已验证",
          "en": "Verified",
          "conditions": [
            "引擎一致性 + 官方策略在 RLSOK 中名义运行 + 10 种子"
          ],
          "reason": "这一级证明引擎正确，不等于训练复现成功"
        }
      },
      {
        "key": "engine_consistency",
        "name_en": "Engine vs upstream mjlab",
        "name_zh": "引擎与上游 mjlab 一致",
        "label": {
          "status": "VERIFIED",
          "zh": "已验证",
          "en": "Verified",
          "conditions": [
            "官方已训练策略、平地、名义模型（无随机化）",
            "RLSOK MuJoCo 3.16.0 CPU"
          ],
          "reason": "证明 RLSOK 引擎与上游实现一致；不证明 RLSOK 能训练出同等策略"
        }
      },
      {
        "key": "seeds",
        "name_en": "10 seeds, joint noise",
        "name_zh": "10 个种子，关节扰动",
        "label": {
          "status": "VERIFIED",
          "zh": "已验证",
          "en": "Verified",
          "conditions": [
            "10 个种子，初始关节扰动 ±0.05 rad，名义模型"
          ],
          "reason": "10/10 不摔倒"
        }
      },
      {
        "key": "g1_upstream",
        "name_en": "Training-distribution randomisation",
        "name_zh": "训练分布随机化",
        "label": {
          "status": "VERIFIED",
          "zh": "已验证",
          "en": "Verified",
          "conditions": [
            "训练分布随机化 g1_upstream，20 回合"
          ],
          "reason": "20/20 不摔倒（判定线 18/20）"
        }
      },
      {
        "key": "rlsok_stress",
        "name_en": "Stress randomisation (recorded only)",
        "name_zh": "压力随机化（只记录）",
        "label": {
          "status": "UNVERIFIED",
          "zh": "未验证",
          "en": "Unverified",
          "conditions": [
            "压力测试 rlsok_stress（比训练分布更宽），只记录不判定"
          ],
          "reason": "20/20 不摔倒"
        }
      },
      {
        "key": "thermal",
        "name_en": "Motor temperature",
        "name_zh": "电机温度",
        "label": {
          "status": "NOT_AVAILABLE",
          "zh": "本机无法运行（未验证）",
          "en": "Cannot run on this machine (unverified)",
          "conditions": [],
          "reason": "该机器人的电机不在电机库（无 kt/R 辨识数据），不做温度预测"
        }
      },
      {
        "key": "level2",
        "name_en": "Level 2 · training reproduction",
        "name_zh": "第二级 · 训练复现",
        "label": {
          "status": "NOT_RUN",
          "zh": "未运行（未验证）",
          "en": "Not run (unverified)",
          "conditions": [],
          "reason": "需要按上游规模训练（GPU）。在完成并通过 level2 判定之前，人形设计不得标“已验证”"
        }
      }
    ]
  }
};
window.RLSOK_EVIDENCE_FULL = {"circuit": {"schema": "rlsok.public-evidence-extract/1", "kind": "Recorded native circuit simulation, not a live browser run", "source_provenance": [{"source_relative_path": "usage/reality-engine-20261018/approved-r1/windows-physical/engine/jobs/rc_v1/result.json", "source_sha256": "cb2d9adb756b40d4d6e9897cb44584171df255136be94f604075d84d77de80d8"}, {"source_relative_path": "usage/reality-engine-20261018/approved-r1/windows-physical/engine/jobs/rc_v2/result.json", "source_sha256": "30e4bb0ee91785c55735bcdbbeb500804fcc86c4259e280cda98063ee29b8f0d"}, {"source_relative_path": "usage/reality-engine-20261018/approved-r1/circuit/AI_REVISION_DECISION.json", "source_sha256": "1ac288b7e2b6a18187c39967c8e99033f4690636a1b993973600e87c4fe8f28c"}], "native_version": "stdout ** ngspice-46 shared library", "before": {"metrics": {"v(out).initial": 0.0, "v(out).final": 1.967346581369448, "v(out).min": 0.0, "v(out).max": 1.967346581369448, "v(in).initial": 0.0, "v(in).final": 5.0, "v(in).min": 0.0, "v(in).max": 5.0, "vsense#branch.initial": 0.0, "vsense#branch.final": 0.0003032653418630904, "vsense#branch.min": 0.0, "vsense#branch.max": 0.0004999999749950009, "time.initial": 0.0, "time.final": 0.005, "time.min": 0.0, "time.max": 0.005, "sample_count": 1025, "simulated_seconds": 0.005}, "checks": [{"metric": "v(out).final", "op": "ge", "value": 4.9, "actual": 1.967346581369448, "passed": false}, {"metric": "v(out).max", "op": "le", "value": 5.001, "actual": 1.967346581369448, "passed": true}, {"metric": "vsense#branch.max", "op": "le", "value": 0.006, "actual": 0.0004999999749950009, "passed": true}, {"metric": "vsense#branch.min", "op": "ge", "value": -1e-06, "actual": 0.0, "passed": true}], "engineering_acceptance": "FAIL"}, "after": {"metrics": {"v(out).initial": 0.0, "v(out).final": 4.966310598484089, "v(out).min": 0.0, "v(out).max": 4.966310598484089, "v(in).initial": 0.0, "v(in).final": 5.0, "v(in).min": 0.0, "v(in).max": 5.0, "vsense#branch.initial": 0.0, "vsense#branch.final": 3.368940151560196e-05, "vsense#branch.min": 0.0, "vsense#branch.max": 0.004999997499672464, "time.initial": 0.0, "time.final": 0.005, "time.min": 0.0, "time.max": 0.005, "sample_count": 1026, "simulated_seconds": 0.005}, "checks": [{"metric": "v(out).final", "op": "ge", "value": 4.9, "actual": 4.966310598484089, "passed": true}, {"metric": "v(out).max", "op": "le", "value": 5.001, "actual": 4.966310598484089, "passed": true}, {"metric": "vsense#branch.max", "op": "le", "value": 0.006, "actual": 0.004999997499672464, "passed": true}, {"metric": "vsense#branch.min", "op": "ge", "value": -1e-06, "actual": 0.0, "passed": true}], "engineering_acceptance": "PASS_SCOPED_SIMULATION"}, "design_change": "Charging resistance: 10000 ohm -> 1000 ohm. Supply, capacitance, target and operating time unchanged.", "limits": ["Ideal circuit model only.", "No physical board, thermal or manufacturing validation.", "Public extract; full local engineering records are not included."]}, "motor": {"schema": "rlsok.public-evidence-extract/1", "kind": "Recorded coupled circuit and mechanical example", "source_provenance": [{"source_relative_path": "usage/reality-engine-20261018/approved-r1/motor/AI_REVISION_DECISION.json", "source_sha256": "0e45b3cbbe68458a127150d8058c28df49b1cfda71ffff4a83070ee0fd167cc6"}, {"source_relative_path": "usage/reality-engine-20261018/approved-r1/delivery-analysis/engine/jobs/motor_joint_analysis/result.json", "source_sha256": "f7d05178063f8f4db23e18f3a01d0345248af85e9429b0ca0cf471dcdbfa604c"}, {"source_relative_path": "usage/reality-engine-20261018/approved-r1/motor/FINAL_DELIVERY.json", "source_sha256": "7b7f8017f9d3dae649588902acc402e62c1f11c0d7308b1fcefbd8dc4de81cef"}], "before": {"angle_rad": 0.07076790435773798, "note": "First exchange, zero-back-EMF initial guess; not a converged solution.", "engineering_acceptance": "FAIL"}, "after": {"scope": "Declared 3 V maxon118743 ideal direct-drive disk model; two actual solver exchanges and explicit SI coupling consistency.", "metrics": {"final_angle_rad": 0.49273013447375835, "maximum_absolute_current_A": 0.43595931502797963, "voltage_residual_V": 1.3038850209035058e-05, "velocity_residual_rad_per_s": 0.0005548446897467585, "driver_resistance_ohm": 4.7, "mechanical_timestep_seconds": 0.0001, "stop_seconds": 0.1}, "checks": [{"metric": "final_angle_rad", "op": "ge", "value": 0.25, "actual": 0.49273013447375835, "passed": true}, {"metric": "maximum_absolute_current_A", "op": "le", "value": 0.5, "actual": 0.43595931502797963, "passed": true}, {"metric": "voltage_residual_V", "op": "le", "value": 0.001, "actual": 1.3038850209035058e-05, "passed": true}, {"metric": "velocity_residual_rad_per_s", "op": "le", "value": 0.01, "actual": 0.0005548446897467585, "passed": true}], "assumptions": ["Ideal direct drive. No gearbox loss, cogging, saturation or temperature variation.", "Bearing and motor friction are omitted for this finite test; manufacturer no-load current does not uniquely determine static and viscous friction.", "Rotor inertia is an axis-only armature; rotor spatial mass is not represented.", "The rigid stop lug has negligible added mass/inertia compared with the specified disk.", "Contact friction is zero; contact compliance is a chosen MuJoCo numerical model, not a validated material law.", "Constant-torque input is a mechanical-only reference. A coupled result requires actual ngspice branch-current samples and back-EMF feedback, with numerical convergence checked.", "No structural strength, thermal, fatigue, PWM-inductance, bearing-life or manufacturing-tolerance qualification."], "limitations": ["Successive waveform convergence only; no timestep convergence or measured hardware validation.", "Manufacturer constants and explicitly idealized disk/contact model only."], "engineering_acceptance": "PASS_SCOPED_SIMULATION"}, "design_change": "Driver resistance: 47 ohm -> 4.7 ohm. Final coupled consistency checked using two native exchanges.", "manufacturing_qualified": false, "representation": "Public numerical extract, not the complete native trace package."}, "gpu": {"schema": "rlsok.public-evidence-extract/1", "kind": "Frozen GPU simulation holdout, not NVIDIA or fabricated-chip performance", "source_provenance": [{"source_relative_path": "usage/holdout-20261008/independent-summary.json", "source_sha256": "2c981081e786340a0150552acd67308dce52614557b9443dbd681a22e84eefa0"}], "output_checks": 184, "numerical": "PASS", "speedup_ratio": 1.0347960813899675, "maximum_candidate_cycle_ratio_to_baseline": 1.0099696575639359, "source_and_candidate_unchanged": true, "status": "PASS", "baseline": "Project-frozen Vortex-derived GPU baseline", "limits": ["Fixed simulation benchmarks only; not a measured commercial GPU comparison.", "Complete design equivalence and full-chip power/performance/area qualification remain incomplete.", "Not evidence of a manufactured GPU or general workload superiority."]}, "robot": {"schema": "rlsok.public-evidence-extract/1", "kind": "Recorded RLSOK MuJoCo benchmark of the official Unitree G1 policy", "source_provenance": [{"source_relative_path": "usage/robot-bench-win-20261020/g1_velocity_flat/run.json", "source_sha256": "2159cb447aedc355989f07a5aacb580dfbdf76c87f52cb71a405ff002e19c827"}, {"source_relative_path": "usage/robot-bench-20261020/g1_velocity_flat/run.json", "source_sha256": "c2b57f70602975544d6c1248dc1290e2bce83f4565905a53e90459aae65e3a12"}], "environment": {"python": "3.12.14", "mujoco": "3.16.0", "platform": "Windows-11-10.0.26200-SP0", "machine": "AMD64"}, "labels": [{"key": "level1", "name_en": "Level 1 · engine + official policy", "name_zh": "第一级 · 引擎 + 官方策略", "label": {"status": "VERIFIED", "zh": "已验证", "en": "Verified", "conditions": ["引擎一致性 + 官方策略在 RLSOK 中名义运行 + 10 种子"], "reason": "这一级证明引擎正确，不等于训练复现成功"}}, {"key": "engine_consistency", "name_en": "Engine vs upstream mjlab", "name_zh": "引擎与上游 mjlab 一致", "label": {"status": "VERIFIED", "zh": "已验证", "en": "Verified", "conditions": ["官方已训练策略、平地、名义模型（无随机化）", "RLSOK MuJoCo 3.16.0 CPU"], "reason": "证明 RLSOK 引擎与上游实现一致；不证明 RLSOK 能训练出同等策略"}}, {"key": "seeds", "name_en": "10 seeds, joint noise", "name_zh": "10 个种子，关节扰动", "label": {"status": "VERIFIED", "zh": "已验证", "en": "Verified", "conditions": ["10 个种子，初始关节扰动 ±0.05 rad，名义模型"], "reason": "10/10 不摔倒"}}, {"key": "g1_upstream", "name_en": "Training-distribution randomisation", "name_zh": "训练分布随机化", "label": {"status": "VERIFIED", "zh": "已验证", "en": "Verified", "conditions": ["训练分布随机化 g1_upstream，20 回合"], "reason": "20/20 不摔倒（判定线 18/20）"}}, {"key": "rlsok_stress", "name_en": "Stress randomisation (recorded only)", "name_zh": "压力随机化（只记录）", "label": {"status": "UNVERIFIED", "zh": "未验证", "en": "Unverified", "conditions": ["压力测试 rlsok_stress（比训练分布更宽），只记录不判定"], "reason": "20/20 不摔倒"}}, {"key": "thermal", "name_en": "Motor temperature", "name_zh": "电机温度", "label": {"status": "NOT_AVAILABLE", "zh": "本机无法运行（未验证）", "en": "Cannot run on this machine (unverified)", "conditions": [], "reason": "该机器人的电机不在电机库（无 kt/R 辨识数据），不做温度预测"}}, {"key": "level2", "name_en": "Level 2 · training reproduction", "name_zh": "第二级 · 训练复现", "label": {"status": "NOT_RUN", "zh": "未运行（未验证）", "en": "Not run (unverified)", "conditions": [], "reason": "需要按上游规模训练（GPU）。在完成并通过 level2 判定之前，人形设计不得标“已验证”"}}], "tracking": [{"segment": "vx+0.5", "axis": "vx", "cmd": 0.5, "mean": 0.49829858001756067, "abs_err": 0.001701419982439334, "rmse": 0.03626390935302589}, {"segment": "vx+1.0", "axis": "vx", "cmd": 1.0, "mean": 1.013828463679747, "abs_err": 0.013828463679746994, "rmse": 0.03948438651989708}, {"segment": "vy+0.3", "axis": "vy", "cmd": 0.3, "mean": 0.22608879206060103, "abs_err": 0.07391120793939895, "rmse": 0.10732589054415954}, {"segment": "wz+0.5", "axis": "wz", "cmd": 0.5, "mean": 0.5298141759395593, "abs_err": 0.029814175939559262, "rmse": 0.10227009272470243}, {"segment": "vx-0.3", "axis": "vx", "cmd": -0.3, "mean": -0.2626662452884466, "abs_err": 0.03733375471155337, "rmse": 0.0436321052008817}], "engine_consistency": {"max_obs_diff": 1.4217692309570145e-05, "max_segment_mean_velocity_diff": 0.014746123435139244, "criterion": "在 mjlab 的同一状态上 RLSOK 观测误差 < 0.0001（float32 量级）；两个引擎各段平均速度差 < 0.05 m/s 或 rad/s；两边都不摔倒。Warp(float32,GPU 内核) 与 MuJoCo C(float64) 不是逐位一致的，只比较统计量"}, "licence": "unitree_rl_mjlab, Apache-2.0", "media_source": "Linux run (usage/robot-bench-20261020); Windows re-run produced no video (ffmpeg missing)"}};
