update `x_m6_2016_11_28`
  set perenimi =  SUBSTRING_INDEX(nimi, ',', 1),
  eesnimi = SUBSTRING_INDEX(SUBSTRING_INDEX(nimi, ',', 2), ',', -1),
  isanimi = If(
    length(nimi) - length(replace(nimi, ',', '')) > 1,
    SUBSTRING_INDEX(SUBSTRING_INDEX(nimi, ',', 3), ',', -1),
    NULL
  ),
  sünniaasta = If(
    length(sünd) >= 4,
    SUBSTRING_INDEX(sünd, '-', 1),
    NULL
  )
