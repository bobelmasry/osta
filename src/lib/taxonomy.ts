/** Trade-based groupings, mirroring the store's "workshop supplies" pages. */
export const trades: { key: string; en: string; ar: string; categories: number[] }[] = [
  { key: "carpentry", en: "Carpentry", ar: "النجارة", categories: [400, 704, 659, 392, 65149, 69458] },
  { key: "plumbing", en: "Plumbing", ar: "السباكة", categories: [401, 65150] },
  { key: "mechanics", en: "Mechanics", ar: "الميكانيكا", categories: [402, 712, 447, 713] },
  { key: "car-wash", en: "Car wash & detailing", ar: "غسيل السيارات", categories: [451, 496, 491, 547] },
  { key: "welding", en: "Welding", ar: "اللحام", categories: [371] },
  { key: "metalwork", en: "Blacksmithing & metalwork", ar: "الحدادة", categories: [411, 414, 408, 383, 412] },
  { key: "electrical", en: "Electrical", ar: "الكهرباء", categories: [365, 403, 630] },
  { key: "construction", en: "Construction & tiling", ar: "البناء والسيراميك", categories: [405, 381, 390, 651] },
  { key: "painting", en: "Painting", ar: "الدهانات", categories: [425, 423, 479] },
  { key: "precision", en: "Precision & measuring", ar: "القياس والدقة", categories: [434, 432] },
  { key: "lathe", en: "Lathe & machining", ar: "المخارط", categories: [379, 69458] },
  { key: "garden", en: "Gardens & farms", ar: "الحدائق والمزارع", categories: [377] },
];
