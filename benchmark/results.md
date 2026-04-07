# Strategy Benchmark Report
_Generated: 2026-04-07T19:06:17.486Z_

Compares **brute-force** (exact: permutations × shelf Cartesian product), **DP / Held-Karp** (exact: bitmask dynamic programming, O(2ⁿ × n × m²)), and **nearest-neighbor** (greedy) on the same scenarios.

---
## Overall summary
| # | Scenario | BF dist | DP dist | NN dist | BF optimal? | DP optimal? | BF time | DP time | NN time |
|---|----------|---------|---------|---------|-------------|-------------|---------|---------|---------|
| 1 | Tiny order — 2 products, 1 shelf each | **15** | **15** | 15 | ✅ | ✅ | 0.054 ms | 0.025 ms | 0.006 ms |
| 2 | Small order — 4 products, 1 shelf each | **26.18** | **26.18** | 30 | ✅ | ✅ | 0.036 ms | 0.017 ms | 0.001 ms |
| 3 | Medium order — 6 products, 1 shelf each | **25.78** | **25.78** | 26.66 | ✅ | ✅ | 1.0 ms | 0.094 ms | 0.006 ms |
| 4 | Multi-shelf — 3 products, 2–3 shelves each | **9.7** | **9.7** | 9.7 | ✅ | ✅ | 0.017 ms | 0.009 ms | 0.001 ms |
| 5 | Multi-shelf — 5 products, 2 shelves each | **16.66** | **16.66** | 17.04 | ✅ | ✅ | 0.488 ms | 0.031 ms | 0.003 ms |
| 6 | 3D warehouse — 4 products across multiple floors | **15.2** | **15.2** | 15.2 | ✅ | ✅ | 0.014 ms | 0.008 ms | 0.002 ms |
| 7 | Large order — 8 products, 1 shelf each (brute-force limit) | **25.06** | **25.06** | 26.39 | ✅ | ✅ | 13.5 ms | 0.185 ms | 0.004 ms |

---

## 1. Tiny order — 2 products, 1 shelf each

> Baseline: trivial case, both strategies should agree.

**Products:** 2 &nbsp;|&nbsp; **Total shelf positions:** 2

### Summary

| Metric | Brute-force | DP (Held-Karp) | Nearest-neighbor |

|--------|-------------|----------------|-----------------|

| Distance | **15** | **15** | 15 |

| Verified optimal? | ✅ yes | ✅ yes | |

| Time (median of 5 runs) | 0.054 ms | 0.025 ms | 0.006 ms |

| Distance gap vs BF | — | — | — |

### Picking order — Brute-force

| Step | Product | Position |
|------|---------|----------|
| 1 | `milk` | `A-01` |
| 2 | `bread` | `B-03` |

### Picking order — DP (Held-Karp)

| Step | Product | Position |
|------|---------|----------|
| 1 | `milk` | `A-01` |
| 2 | `bread` | `B-03` |

### Picking order — Nearest-neighbor

| Step | Product | Position |
|------|---------|----------|
| 1 | `milk` | `A-01` |
| 2 | `bread` | `B-03` |

---

## 2. Small order — 4 products, 1 shelf each

> Nearest-neighbor may deviate from optimal on non-linear layouts.

**Products:** 4 &nbsp;|&nbsp; **Total shelf positions:** 4

### Summary

| Metric | Brute-force | DP (Held-Karp) | Nearest-neighbor |

|--------|-------------|----------------|-----------------|

| Distance | **26.18** | **26.18** | 30 |

| Verified optimal? | ✅ yes | ✅ yes | |

| Time (median of 5 runs) | 0.036 ms | 0.017 ms | 0.001 ms |

| Distance gap vs BF | — | — | +3.82 (NN longer) |

### Picking order — Brute-force

| Step | Product | Position |
|------|---------|----------|
| 1 | `apples` | `A-10` |
| 2 | `cheese` | `C-02` |
| 3 | `butter` | `B-07` |
| 4 | `eggs` | `D-15` |

### Picking order — DP (Held-Karp)

| Step | Product | Position |
|------|---------|----------|
| 1 | `apples` | `A-10` |
| 2 | `cheese` | `C-02` |
| 3 | `butter` | `B-07` |
| 4 | `eggs` | `D-15` |

### Picking order — Nearest-neighbor

| Step | Product | Position |
|------|---------|----------|
| 1 | `apples` | `A-10` |
| 2 | `butter` | `B-07` |
| 3 | `cheese` | `C-02` |
| 4 | `eggs` | `D-15` |

---

## 3. Medium order — 6 products, 1 shelf each

> Spread across the warehouse floor, tests visit-order optimality.

**Products:** 6 &nbsp;|&nbsp; **Total shelf positions:** 6

### Summary

| Metric | Brute-force | DP (Held-Karp) | Nearest-neighbor |

|--------|-------------|----------------|-----------------|

| Distance | **25.78** | **25.78** | 26.66 |

| Verified optimal? | ✅ yes | ✅ yes | |

| Time (median of 5 runs) | 1.0 ms | 0.094 ms | 0.006 ms |

| Distance gap vs BF | — | — | +0.88 (NN longer) |

### Picking order — Brute-force

| Step | Product | Position |
|------|---------|----------|
| 1 | `p6` | `S-06` |
| 2 | `p1` | `S-01` |
| 3 | `p2` | `S-02` |
| 4 | `p5` | `S-05` |
| 5 | `p3` | `S-03` |
| 6 | `p4` | `S-04` |

### Picking order — DP (Held-Karp)

| Step | Product | Position |
|------|---------|----------|
| 1 | `p6` | `S-06` |
| 2 | `p1` | `S-01` |
| 3 | `p2` | `S-02` |
| 4 | `p5` | `S-05` |
| 5 | `p3` | `S-03` |
| 6 | `p4` | `S-04` |

### Picking order — Nearest-neighbor

| Step | Product | Position |
|------|---------|----------|
| 1 | `p1` | `S-01` |
| 2 | `p6` | `S-06` |
| 3 | `p5` | `S-05` |
| 4 | `p2` | `S-02` |
| 5 | `p3` | `S-03` |
| 6 | `p4` | `S-04` |

---

## 4. Multi-shelf — 3 products, 2–3 shelves each

> Core scenario: each product stocked at multiple locations. Greedy shelf-selection can miss the globally shorter route.

**Products:** 3 &nbsp;|&nbsp; **Total shelf positions:** 7

### Summary

| Metric | Brute-force | DP (Held-Karp) | Nearest-neighbor |

|--------|-------------|----------------|-----------------|

| Distance | **9.7** | **9.7** | 9.7 |

| Verified optimal? | ✅ yes | ✅ yes | |

| Time (median of 5 runs) | 0.017 ms | 0.009 ms | 0.001 ms |

| Distance gap vs BF | — | — | — |

### Picking order — Brute-force

| Step | Product | Position |
|------|---------|----------|
| 1 | `milk` | `milk-near` |
| 2 | `cereal` | `cereal-B` |
| 3 | `juice` | `juice-B` |

### Picking order — DP (Held-Karp)

| Step | Product | Position |
|------|---------|----------|
| 1 | `milk` | `milk-near` |
| 2 | `cereal` | `cereal-B` |
| 3 | `juice` | `juice-B` |

### Picking order — Nearest-neighbor

| Step | Product | Position |
|------|---------|----------|
| 1 | `milk` | `milk-near` |
| 2 | `cereal` | `cereal-B` |
| 3 | `juice` | `juice-B` |

---

## 5. Multi-shelf — 5 products, 2 shelves each

> Larger multi-shelf case — exposes compound shelf-selection errors.

**Products:** 5 &nbsp;|&nbsp; **Total shelf positions:** 10

### Summary

| Metric | Brute-force | DP (Held-Karp) | Nearest-neighbor |

|--------|-------------|----------------|-----------------|

| Distance | **16.66** | **16.66** | 17.04 |

| Verified optimal? | ✅ yes | ✅ yes | |

| Time (median of 5 runs) | 0.488 ms | 0.031 ms | 0.003 ms |

| Distance gap vs BF | — | — | +0.38 (NN longer) |

### Picking order — Brute-force

| Step | Product | Position |
|------|---------|----------|
| 1 | `p1` | `p1-a` |
| 2 | `p2` | `p2-b` |
| 3 | `p4` | `p4-a` |
| 4 | `p5` | `p5-a` |
| 5 | `p3` | `p3-a` |

### Picking order — DP (Held-Karp)

| Step | Product | Position |
|------|---------|----------|
| 1 | `p1` | `p1-a` |
| 2 | `p2` | `p2-b` |
| 3 | `p4` | `p4-a` |
| 4 | `p5` | `p5-a` |
| 5 | `p3` | `p3-a` |

### Picking order — Nearest-neighbor

| Step | Product | Position |
|------|---------|----------|
| 1 | `p1` | `p1-a` |
| 2 | `p3` | `p3-b` |
| 3 | `p2` | `p2-a` |
| 4 | `p4` | `p4-b` |
| 5 | `p5` | `p5-b` |

---

## 6. 3D warehouse — 4 products across multiple floors

> Z-axis matters: products on different floors (z = floor level).

**Products:** 4 &nbsp;|&nbsp; **Total shelf positions:** 6

### Summary

| Metric | Brute-force | DP (Held-Karp) | Nearest-neighbor |

|--------|-------------|----------------|-----------------|

| Distance | **15.2** | **15.2** | 15.2 |

| Verified optimal? | ✅ yes | ✅ yes | |

| Time (median of 5 runs) | 0.014 ms | 0.008 ms | 0.002 ms |

| Distance gap vs BF | — | — | — |

### Picking order — Brute-force

| Step | Product | Position |
|------|---------|----------|
| 1 | `item-D` | `F1-D` |
| 2 | `item-B` | `F1-B` |
| 3 | `item-A` | `F1-A` |
| 4 | `item-C` | `F2-C` |

### Picking order — DP (Held-Karp)

| Step | Product | Position |
|------|---------|----------|
| 1 | `item-B` | `F1-B` |
| 2 | `item-D` | `F1-D` |
| 3 | `item-A` | `F1-A` |
| 4 | `item-C` | `F2-C` |

### Picking order — Nearest-neighbor

| Step | Product | Position |
|------|---------|----------|
| 1 | `item-B` | `F1-B` |
| 2 | `item-D` | `F1-D` |
| 3 | `item-A` | `F1-A` |
| 4 | `item-C` | `F2-C` |

---

## 7. Large order — 8 products, 1 shelf each (brute-force limit)

> At n=8 brute-force evaluates 40 320 permutations. Shows timing cost at the configured maximum.

**Products:** 8 &nbsp;|&nbsp; **Total shelf positions:** 8

### Summary

| Metric | Brute-force | DP (Held-Karp) | Nearest-neighbor |

|--------|-------------|----------------|-----------------|

| Distance | **25.06** | **25.06** | 26.39 |

| Verified optimal? | ✅ yes | ✅ yes | |

| Time (median of 5 runs) | 13.5 ms | 0.185 ms | 0.004 ms |

| Distance gap vs BF | — | — | +1.33 (NN longer) |

### Picking order — Brute-force

| Step | Product | Position |
|------|---------|----------|
| 1 | `q1` | `R1` |
| 2 | `q5` | `R5` |
| 3 | `q7` | `R7` |
| 4 | `q4` | `R4` |
| 5 | `q3` | `R3` |
| 6 | `q6` | `R6` |
| 7 | `q8` | `R8` |
| 8 | `q2` | `R2` |

### Picking order — DP (Held-Karp)

| Step | Product | Position |
|------|---------|----------|
| 1 | `q1` | `R1` |
| 2 | `q5` | `R5` |
| 3 | `q7` | `R7` |
| 4 | `q4` | `R4` |
| 5 | `q3` | `R3` |
| 6 | `q6` | `R6` |
| 7 | `q8` | `R8` |
| 8 | `q2` | `R2` |

### Picking order — Nearest-neighbor

| Step | Product | Position |
|------|---------|----------|
| 1 | `q1` | `R1` |
| 2 | `q5` | `R5` |
| 3 | `q7` | `R7` |
| 4 | `q4` | `R4` |
| 5 | `q6` | `R6` |
| 6 | `q8` | `R8` |
| 7 | `q2` | `R2` |
| 8 | `q3` | `R3` |

---
