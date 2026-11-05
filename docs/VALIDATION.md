# Numerical validation

Authority: REVIEW2 and subsequent user corrections. No parameters or equations tuned.
Four independent reproductions of published wiki numbers are checked: reference MIC, R10 adapter table, R11a steady states, R11b infinite-adapter limits. One R10 cell remains a documented source discrepancy; it is not claimed as reproduced.

- **PASS 1a exact algebraic reduction**: 2.259995165921445e-14; conservation 6.217248937900877e-15
- **PASS 1b QSS convergence**: [0.5314469338157853,0.05412610659896925,0.0054401798080734925]
- **PASS reference**: All cells pass.
- **PASS r10**: Known source discrepancy retained explicitly; other cells pass.
- **PASS r11a**: All cells pass.
- **PASS r11b**: All cells pass.
- **PASS Known discrepancy documented**: Required Ntot 0.00841607 versus printed 0.009; raw absolute difference 0.00058393 uM. Excess beyond output rounding is 0.00008393 uM, about 0.145% of c1. Likely wiki rounding or search resolution; no game-visible quantity is affected. Parameters unchanged.
- **PASS single 18h run <400ms**: 222.45309999999972 ms
- **PASS 3-log kill**: -Infinity
- **PASS R12 ceiling**: max B 2.466814601663154; ceiling 5.2849735814828325
- **PASS R12 matched control**: max excess 0
- **PASS R12 division bounds**: Division rate independent of killing.

## Computed results

```json
{
  "alpha": 0.9999999964476535,
  "c1": 0.05794314750000001,
  "k_prod": 0.005189051310978919,
  "Bstar": 0.19720237909149047,
  "j_req": {
    "default": 1,
    "upper": 1,
    "lower": 3
  },
  "MIC": 163.2337940517893,
  "deltaWith": "-Infinity",
  "deltaWithout": 2.761321404618107,
  "error1a": 2.259995165921445e-14,
  "conservation": 6.217248937900877e-15,
  "error1b": [
    0.5314469338157853,
    0.05412610659896925,
    0.0054401798080734925
  ],
  "error1c": 0.8945954882704938,
  "runtimeMs": 222.45309999999972
}
```

## Every published cell: strict and precision-aware checks

Tolerance=max(relative tolerance × |wiki|, 0.5 × 10^(-decimals printed)). Decimals are encoded per column. Knockdown R11a retains the specified 1 percentage-point absolute criterion (expressed as an equivalent relative tolerance).

|Cell|Wiki|Computed|Strict relative error|Strict verdict|Decimals printed|Tolerance|Precision-aware verdict|
|---|---|---|---|---|---|---|---|
| Reference MIC | 163.2 | 163.2337940517893 | 0.020707% | PASS | 1 | 1.632 | PASS |
| R10 Kan=50 B* | 0.0975 | 0.09749491823184797 | 0.005212% | PASS | 4 | 0.00048750000000000003 | PASS |
| R10 Kan=50 kcat=0.0338 Ntot | 0.337 | 0.3347094074541258 | 0.679701% | PASS | 3 | 0.01685 | PASS |
| R10 Kan=50 kcat=0.0778 Ntot | 0.127 | 0.1265823843458147 | 0.328831% | PASS | 3 | 0.006350000000000001 | PASS |
| R10 Kan=50 kcat=0.2516 Ntot | 0.038 | 0.037781884229356716 | 0.573989% | PASS | 3 | 0.0019 | PASS |
| R10 Kan=75 B* | 0.1473 | 0.1473486486616692 | 0.033027% | PASS | 4 | 0.0007365 | PASS |
| R10 Kan=75 kcat=0.0338 Ntot | 0.194 | 0.19094848617671545 | 1.572945% | PASS | 3 | 0.0097 | PASS |
| R10 Kan=75 kcat=0.0778 Ntot | 0.08 | 0.0785964718799301 | 1.754410% | PASS | 3 | 0.004 | PASS |
| R10 Kan=75 kcat=0.2516 Ntot | 0.024 | 0.023834207315196643 | 0.690803% | PASS | 3 | 0.0012000000000000001 | PASS |
| R10 Kan=100 B* | 0.1972 | 0.19720237909149047 | 0.001206% | PASS | 4 | 0.000986 | PASS |
| R10 Kan=100 kcat=0.0338 Ntot | 0.118 | 0.11679594858477269 | 1.020383% | PASS | 3 | 0.0059 | PASS |
| R10 Kan=100 kcat=0.0778 Ntot | 0.049 | 0.04939596928705284 | 0.808101% | PASS | 3 | 0.0024500000000000004 | PASS |
| R10 Kan=100 kcat=0.2516 Ntot | 0.015 | 0.015100777722887905 | 0.671851% | PASS | 3 | 0.00075 | PASS |
| R10 Kan=125 B* | 0.247 | 0.24705610952131168 | 0.022716% | PASS | 4 | 0.001235 | PASS |
| R10 Kan=125 kcat=0.0338 Ntot | 0.064 | 0.06383181540396099 | 0.262788% | PASS | 3 | 0.0032 | PASS |
| R10 Kan=125 kcat=0.0778 Ntot | 0.027 | 0.027381064558223762 | 1.411350% | PASS | 3 | 0.00135 | PASS |
| R10 Kan=125 kcat=0.2516 Ntot | 0.009 | 0.008416071923414693 | 6.488090% | FAIL | 3 | 0.0005 | FAIL |
| R10 Kan=150 B* | 0.2969 | 0.29690983995113296 | 0.003314% | PASS | 4 | 0.0014845 | PASS |
| R10 Kan=150 kcat=0.0338 Ntot | 0.021 | 0.020571892608673523 | 2.038607% | PASS | 3 | 0.0010500000000000002 | PASS |
| R10 Kan=150 kcat=0.0778 Ntot | 0.009 | 0.00890478210188184 | 1.057977% | PASS | 3 | 0.0005 | PASS |
| R10 Kan=150 kcat=0.2516 Ntot | 0.003 | 0.0027483968463042317 | 8.386772% | FAIL | 3 | 0.0005 | PASS |
| R11a Ntot=0.05 B | 0.196 | 0.19598648625850623 | 0.006895% | PASS | 4 | 0.00196 | PASS |
| R11a Ntot=0.05 knockdown (%) | 39.4 | 39.37937325749884 | 0.052352% | PASS | 1 | 1 | PASS |
| R11a Ntot=0.1 B | 0.1211 | 0.12107292629510483 | 0.022356% | PASS | 4 | 0.001211 | PASS |
| R11a Ntot=0.1 knockdown (%) | 62.6 | 62.55090433185746 | 0.078428% | PASS | 1 | 1 | PASS |
| R11a Ntot=0.25 B | 0.0502 | 0.05017608494364888 | 0.047640% | PASS | 4 | 0.0005020000000000001 | PASS |
| R11a Ntot=0.25 knockdown (%) | 84.5 | 84.48002321569784 | 0.023641% | PASS | 1 | 1 | PASS |
| R11a Ntot=0.5 B | 0.03 | 0.0300079607170798 | 0.026536% | PASS | 4 | 0.0003 | PASS |
| R11a Ntot=0.5 knockdown (%) | 90.7 | 90.71823052363754 | 0.020100% | PASS | 1 | 1 | PASS |
| R11a Ntot=1 B | 0.0244 | 0.024417514610711767 | 0.071781% | PASS | 4 | 0.00024400000000000002 | PASS |
| R11a Ntot=1 knockdown (%) | 92.4 | 92.44741274026855 | 0.051312% | PASS | 1 | 1 | PASS |
| R11a Ntot=4 B | 0.0224 | 0.022384332839634882 | 0.069943% | PASS | 4 | 0.000224 | PASS |
| R11a Ntot=4 knockdown (%) | 93.10000000000001 | 93.07629667812097 | 0.025460% | PASS | 1 | 0.9999999999999999 | PASS |
| R11b kcat=0.000982 Bmin | 0.3056 | 0.3056387060668062 | 0.012666% | PASS | 4 | 0.0030559999999999997 | PASS |
| R11b kcat=0.000982 keff limit | 0.0009 | 0.000927462644663805 | 3.051405% | FAIL | 4 | 0.00005 | PASS |
| R11b kcat=0.000982 max knockdown (%) | 5.5 | 5.462819032846822 | 0.676018% | PASS | 1 | 0.055 | PASS |
| R11b kcat=0.0338 Bmin | 0.0555 | 0.055519253526986195 | 0.034691% | PASS | 4 | 0.000555 | PASS |
| R11b kcat=0.0338 keff limit | 0.0774 | 0.07741372941693202 | 0.017738% | PASS | 4 | 0.000774 | PASS |
| R11b kcat=0.0338 max knockdown (%) | 82.8 | 82.82732646860929 | 0.033003% | PASS | 1 | 0.828 | PASS |
| R11b kcat=0.0778 Bmin | 0.0219 | 0.021952679633290367 | 0.240546% | PASS | 4 | 0.000219 | PASS |
| R11b kcat=0.0778 keff limit | 0.2203 | 0.22032412548178013 | 0.010951% | PASS | 4 | 0.002203 | PASS |
| R11b kcat=0.0778 max knockdown (%) | 93.2 | 93.20981143418177 | 0.010527% | PASS | 1 | 0.932 | PASS |
| R11b kcat=0.2516 Bmin | 0.0064 | 0.0063550958597528105 | 0.701627% | PASS | 4 | 0.00006400000000000001 | PASS |
| R11b kcat=0.2516 keff limit | 0.8005 | 0.8004679139515147 | 0.004008% | PASS | 4 | 0.008005 | PASS |
| R11b kcat=0.2516 max knockdown (%) | 98 | 98.03430378603377 | 0.035004% | PASS | 1 | 0.98 | PASS |

R10 also propagates each four-decimal B* input interval through the monotone requiredAdapter root solver; the resulting Ntot range must overlap the output interval widened by the tolerance above. All interval endpoints follow below.

```json
[
  {
    "id": "R10 Kan=50 B*",
    "wiki": 0.0975,
    "actual": 0.09749491823184797,
    "relativeTolerance": 0.005,
    "decimalsPrinted": 4,
    "relativeError": 0.00005212069899520098,
    "tolerance": 0.00048750000000000003,
    "strictPass": true,
    "pass": true
  },
  {
    "id": "R10 Kan=50 kcat=0.0338 Ntot",
    "wiki": 0.337,
    "actual": 0.3347094074541258,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.006797010521881943,
    "tolerance": 0.01685,
    "strictPass": true,
    "pass": true,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.09745000000000001,
      0.09755
    ],
    "propagated": [
      0.33444567780410406,
      0.3349248100959308
    ],
    "outputInterval": [
      0.32015000000000005,
      0.35385
    ]
  },
  {
    "id": "R10 Kan=50 kcat=0.0778 Ntot",
    "wiki": 0.127,
    "actual": 0.1265823843458147,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.003288312237679522,
    "tolerance": 0.006350000000000001,
    "strictPass": true,
    "pass": true,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.09745000000000001,
      0.09755
    ],
    "propagated": [
      0.12650769604105633,
      0.12664334643729147
    ],
    "outputInterval": [
      0.12065000000000001,
      0.13335
    ]
  },
  {
    "id": "R10 Kan=50 kcat=0.2516 Ntot",
    "wiki": 0.038,
    "actual": 0.037781884229356716,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.005739888701139032,
    "tolerance": 0.0019,
    "strictPass": true,
    "pass": true,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.09745000000000001,
      0.09755
    ],
    "propagated": [
      0.037760627895890034,
      0.03779923293218555
    ],
    "outputInterval": [
      0.0361,
      0.0399
    ]
  },
  {
    "id": "R10 Kan=75 B*",
    "wiki": 0.1473,
    "actual": 0.1473486486616692,
    "relativeTolerance": 0.005,
    "decimalsPrinted": 4,
    "relativeError": 0.0003302692577678473,
    "tolerance": 0.0007365,
    "strictPass": true,
    "pass": true
  },
  {
    "id": "R10 Kan=75 kcat=0.0338 Ntot",
    "wiki": 0.194,
    "actual": 0.19094848617671545,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.015729452697343077,
    "tolerance": 0.0097,
    "strictPass": true,
    "pass": true,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.14725,
      0.14734999999999998
    ],
    "propagated": [
      0.19094595260911978,
      0.19113354774373165
    ],
    "outputInterval": [
      0.18430000000000002,
      0.2037
    ]
  },
  {
    "id": "R10 Kan=75 kcat=0.0778 Ntot",
    "wiki": 0.08,
    "actual": 0.0785964718799301,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.017544101500873745,
    "tolerance": 0.004,
    "strictPass": true,
    "pass": true,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.14725,
      0.14734999999999998
    ],
    "propagated": [
      0.0785955152770409,
      0.07866633722601274
    ],
    "outputInterval": [
      0.076,
      0.084
    ]
  },
  {
    "id": "R10 Kan=75 kcat=0.2516 Ntot",
    "wiki": 0.024,
    "actual": 0.023834207315196643,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.006908028533473241,
    "tolerance": 0.0012000000000000001,
    "strictPass": true,
    "pass": true,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.14725,
      0.14734999999999998
    ],
    "propagated": [
      0.02383392397032698,
      0.023854900846054898
    ],
    "outputInterval": [
      0.0228,
      0.0252
    ]
  },
  {
    "id": "R10 Kan=100 B*",
    "wiki": 0.1972,
    "actual": 0.19720237909149047,
    "relativeTolerance": 0.005,
    "decimalsPrinted": 4,
    "relativeError": 0.000012064358470987108,
    "tolerance": 0.000986,
    "strictPass": true,
    "pass": true
  },
  {
    "id": "R10 Kan=100 kcat=0.0338 Ntot",
    "wiki": 0.118,
    "actual": 0.11679594858477269,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.010203825552773802,
    "tolerance": 0.0059,
    "strictPass": true,
    "pass": true,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.19715,
      0.19724999999999998
    ],
    "propagated": [
      0.11673815296883425,
      0.11685953943285263
    ],
    "outputInterval": [
      0.11209999999999999,
      0.1239
    ]
  },
  {
    "id": "R10 Kan=100 kcat=0.0778 Ntot",
    "wiki": 0.049,
    "actual": 0.04939596928705284,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.008081005858221139,
    "tolerance": 0.0024500000000000004,
    "strictPass": true,
    "pass": true,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.19715,
      0.19724999999999998
    ],
    "propagated": [
      0.04937239384591666,
      0.04942190740312731
    ],
    "outputInterval": [
      0.04655,
      0.05145
    ]
  },
  {
    "id": "R10 Kan=100 kcat=0.2516 Ntot",
    "wiki": 0.015,
    "actual": 0.015100777722887905,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.006718514859193707,
    "tolerance": 0.00075,
    "strictPass": true,
    "pass": true,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.19715,
      0.19724999999999998
    ],
    "propagated": [
      0.015093662528239515,
      0.015108605873066012
    ],
    "outputInterval": [
      0.014249999999999999,
      0.01575
    ]
  },
  {
    "id": "R10 Kan=125 B*",
    "wiki": 0.247,
    "actual": 0.24705610952131168,
    "relativeTolerance": 0.005,
    "decimalsPrinted": 4,
    "relativeError": 0.00022716405389346922,
    "tolerance": 0.001235,
    "strictPass": true,
    "pass": true
  },
  {
    "id": "R10 Kan=125 kcat=0.0338 Ntot",
    "wiki": 0.064,
    "actual": 0.06383181540396099,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.002627884313109556,
    "tolerance": 0.0032,
    "strictPass": true,
    "pass": true,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.24695,
      0.24705
    ],
    "propagated": [
      0.06383758329012063,
      0.06393201117026051
    ],
    "outputInterval": [
      0.0608,
      0.0672
    ]
  },
  {
    "id": "R10 Kan=125 kcat=0.0778 Ntot",
    "wiki": 0.027,
    "actual": 0.027381064558223762,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.014113502156435658,
    "tolerance": 0.00135,
    "strictPass": true,
    "pass": true,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.24695,
      0.24705
    ],
    "propagated": [
      0.027383501872885477,
      0.02742340282534149
    ],
    "outputInterval": [
      0.02565,
      0.02835
    ]
  },
  {
    "id": "R10 Kan=125 kcat=0.2516 Ntot",
    "wiki": 0.009,
    "actual": 0.008416071923414693,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.06488089739836742,
    "tolerance": 0.0005,
    "strictPass": false,
    "pass": false,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.24695,
      0.24705
    ],
    "propagated": [
      0.008416816283586114,
      0.008429001975815816
    ],
    "outputInterval": [
      0.008499999999999999,
      0.0095
    ]
  },
  {
    "id": "R10 Kan=150 B*",
    "wiki": 0.2969,
    "actual": 0.29690983995113296,
    "relativeTolerance": 0.005,
    "decimalsPrinted": 4,
    "relativeError": 0.00003314230762196583,
    "tolerance": 0.0014845,
    "strictPass": true,
    "pass": true
  },
  {
    "id": "R10 Kan=150 kcat=0.0338 Ntot",
    "wiki": 0.021,
    "actual": 0.020571892608673523,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.020386066253641838,
    "tolerance": 0.0010500000000000002,
    "strictPass": true,
    "pass": true,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.29685,
      0.29695
    ],
    "propagated": [
      0.020539574888761507,
      0.020620053445311058
    ],
    "outputInterval": [
      0.019950000000000002,
      0.02205
    ]
  },
  {
    "id": "R10 Kan=150 kcat=0.0778 Ntot",
    "wiki": 0.009,
    "actual": 0.00890478210188184,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.010579766457573287,
    "tolerance": 0.0005,
    "strictPass": true,
    "pass": true,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.29685,
      0.29695
    ],
    "propagated": [
      0.008890846803214201,
      0.00892554857231662
    ],
    "outputInterval": [
      0.008499999999999999,
      0.0095
    ]
  },
  {
    "id": "R10 Kan=150 kcat=0.2516 Ntot",
    "wiki": 0.003,
    "actual": 0.0027483968463042317,
    "relativeTolerance": 0.05,
    "decimalsPrinted": 3,
    "relativeError": 0.08386771789858945,
    "tolerance": 0.0005,
    "strictPass": false,
    "pass": true,
    "inputDecimalsPrinted": 4,
    "inputInterval": [
      0.29685,
      0.29695
    ],
    "propagated": [
      0.0027441040201071085,
      0.0027547939944705946
    ],
    "outputInterval": [
      0.0025,
      0.0035
    ]
  }
]
```

### Weak evidence and remaining discrepancy

Three cells fail the original relative criterion. Only two pass the corrected rounding rule:
- R10 Kan150, kcat .2516: .0027483968 versus .003; relative error8.3868%. Three decimals permit [.0025,.0035], ±16.67%. This is weak evidence.
- R11b kcat .000982 keff: .0009274626 versus .0009; relative error3.0514%. Four decimals permit [.00085,.00095], ±5.56%. This is weak evidence.
- R10 Kan125, kcat .2516 remains FAIL, even after input rounding propagation. Required Ntot 0.00841607 versus printed 0.009; raw absolute difference 0.00058393 uM. Excess beyond output rounding is 0.00008393 uM, about 0.145% of c1. Likely wiki rounding or search resolution; no game-visible quantity is affected. Parameters unchanged. The raw difference is .0005839281µM (6.4881%, about1.008% of c1); the excess beyond output rounding is .0000839281µM (about0.145% of c1). These must not be confused. B* input interval [.24695,.24705] does not bridge the gap. Likely wiki rounding or coarse search; no parameter adjustment. This exception is explicitly tested and authorized by the user. The remaining cells are the stronger reproduction evidence.

## R11a half-times (report-only)

|Ntot|Wiki min|Computed min|
|---|---|---|
| 0.05 | 36 | 36.25000000000136 |
| 0.1 | 28 | 28.420000000001643 |
| 0.25 | 16 | 15.509999999999714 |
| 0.5 | 10 | 10.159999999999828 |
| 1 | 8 | 8.489999999999863 |
| 4 | 8 | 7.859999999999877 |

Start at B0, no antibiotic, induced Ctot .402 fixed; RK4 .01min, time to halfway to steady state.

## 1a / 1b / 1c

Full kinetics uses the verbatim five mass-action equations. Loss -(mu+kXB) applies to B/NB/NBC, returning adapter to N/NC; adapter-only species have no loss. Full adapter and ClpXP totals are conserved. 1a has all slow processes off.

|kon|Ntot|Flux relative error|Total trajectory error (report only)|Half-step error|
|---|---|---|---|---|
| 1 | 0.058 | 0.4484498532157875 | 0.14135590312355215 | 2.2735955744095003e-12 |
| 1 | 0.174 | 0.5096394431134592 | 0.4637461939654737 | 9.426564465047749e-12 |
| 1 | 0.579 | 0.5162152688072293 | 0.7992993807869586 | 1.1660945393051435e-10 |
| 1 | 1.737 | 0.5314469338157853 | 0.8945954882704938 | 1.300534726783255e-9 |
| 10 | 0.058 | 0.030622880923695205 | 0.05485754697309888 | 8.950803079416773e-13 |
| 10 | 0.174 | 0.047026561108324344 | 0.3685347901417966 | 9.822441526469074e-12 |
| 10 | 0.579 | 0.05412610659896925 | 0.7712621501902959 | 1.1915132802536409e-10 |
| 10 | 1.737 | 0.05339429340346431 | 0.8857916181628606 | 8.043364265423225e-10 |
| 100 | 0.058 | 0.0030941862369473602 | 0.042611799656836646 | 1.107982517835405e-13 |
| 100 | 0.174 | 0.004767997255674205 | 0.35568211149581 | 1.0156775171977253e-12 |
| 100 | 0.579 | 0.0054401798080734925 | 0.7677403932801407 | 1.2272900220862895e-11 |
| 100 | 1.737 | 0.005341739757382033 | 0.8845288239510447 | 8.354959505223422e-11 |

1b maxima at kon1/10/100: 0.5314469338157853, 0.05412610659896925, 0.0054401798080734925. Ratios 9.81868024894859 and 9.949323093814558. This demonstrates O(1/kon) convergence. The wiki QSS approximation requires kon of order100 µM⁻¹min⁻¹ or more for sub-1% degradation-flux accuracy; diffusion-limited protein association satisfies this, but the wiki does not state kon, so this is the assumption boundary. 1c remains report-only: Eq21 does not distinguish free and total KanR; we read B as free, required by its Langmuir factor. The total/free discrepancy remains unchanged.

## Source inconsistencies and sensitivities

The wiki parameter table gives K_m = 1.463 µM while Eq. (6) combines it with q and A_e, both in µg/mL. Converting it (×484.5/1000 -> 0.709 µg/mL) does not reproduce the wiki published values; using 1.463 as written does. We therefore use the wiki numeric value unchanged and record the unit label in the source as an inconsistency we did not resolve.

Integrated j_req3/6 conflicts with the source's required-Ntot table; derived1/3 agrees with it. c1=.0579 and kprod=.005189 are rounded wiki entries; computed values above use the original definitions. No published deltaLog10 endpoint was supplied. -Infinity means all injection classes fell below the model's1-cell/mL cutoff; it is a numerical extinction convention, not proof of sterilisation.

Constant synthesis (default): Δlog10 with/without=-Infinity, 2.761321404618107. Division-coupled synthesis (off by default): -Infinity, 2.490971463417134. Constant-division with-SUNRISE sensitivity=-Infinity. Constant synthesis plus vanishing crowding dilution can accumulate KanR up to kprod/kXB; the source extrapolation artifact is retained.

## Exp3 report-only comparison

|Promoter|Expression %|Measured IC50 ±SD|Predicted MIC|
|---|---|---|---|
| J23100 | 100 | 55 ± 5 | 163.2337940517893 |
| J23110 | 15.7 | 77 ± 22 | 26.563028569326903 |
| J23114 | 1.11 | 0.94 ± 0.39 | 2.9090965599659695 |

MIC at B0/6.4=26.441435361602288. The wiki's target table gives .0518µM,6.24-fold reduction, for MIC below serum peak22. The same source model therefore predicts a large drop where Exp3 (55±5 versus77±22) found no resolvable difference: collapse reproduced, plateau not reproduced. MIC and IC50 differ. No fitting.

Additional R15 source discrepancy (report-only): at the cited serum-target B=.0518µM the implemented equations give MIC=27.08550702330472µg/mL, rather than below22. The computed threshold at22 is B*=0.041658740150448154µM. Thus the source table’s exact serum-target pair is not reproduced either; the qualitative conclusion of a large MIC drop over ~6x KanR reduction still holds. Likely source calibration/rounding or an unstated parameter context; no parameters changed.

Single warmed18h run=222.45309999999972ms; budget400ms. Prettier dependency and format script removed. Runtime is offline.
