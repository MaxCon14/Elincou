Product media naming convention
================================

Rotating 3D turntable videos (shown when present, autoplay + loop):
  Diesse Chorus EVO.mp4  ->  DIESSE Chorus Evo         [IN PLACE]
  BS-1000M.mp4           ->  Mindray BS-1000M          [IN PLACE]
  product-02.mp4         ->  Automated liquid handler
  product-03.mp4         ->  HTC PKL sample processor

Still photos (fallback / poster when no video exists):
  product-01.jpg  ->  DIESSE Chorus Evo
  product-02.jpg  ->  Automated liquid handler
  product-03.jpg  ->  HTC PKL sample processor
  product-04.jpg  ->  Mindray BS-1000M

Filenames must match what index.html references in each card's
<source src="..."> tag - if you add or rename a file, update the
matching card in index.html to point at it.
Videos: MP4 (H.264), landscape, seamless loop recommended.
Images: JPG or PNG at least 1400px wide (rename extension in index.html if PNG).
