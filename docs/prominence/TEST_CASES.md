# Prominence --- Test Cases

## T-001 --- Omu

**PASS**

Potwierdzone: `l0_basins` jako ridge network, river cuts, routing po
poprawnym grzbiecie, raw zgodny z MERIT.

## T-002 --- Moldoveanu → Dukla

**PASS**

``` text
Peak: 45.5995641, 24.7361706
Saddle: 49.4175, 21.6964
Straight: 482.2 km
Sources: basins22.db, basins23.db, rivers22.db, rivers23.db, CarpathiansDEM.tif
```

``` text
20 km   no path
30 km   no path
45 km   no path
65 km   no path
90 km   no path
120 km  no path
130 km  no path
140 km  PATH FOUND
```

Przy 140 km: raw \~1435.18 km, peak snap \~6.6 m, saddle snap \~47.6 m.
Szeroki corridor wynika z łuku głównego ridge; Howerla jest około 124 km
od prostej Peak--Saddle. Walidacja z ręcznym ridge Karpat: bardzo wysoka
zgodność.

## Dla przyszłych testów zapisuj

Peak/Saddle, współrzędne, źródła, DEM, algorithm version, parameters,
corridors, used corridor, graph nodes/edges, snap distances, raw length,
river-crossing check, status, uwagi walidacyjne.
