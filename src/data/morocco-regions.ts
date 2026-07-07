export type Commune = {
  name: string;
  slug: string;
};

export type Province = {
  name: string;
  slug: string;
  communes: Commune[];
};

export type MoroccoRegion = {
  name: string;
  slug: string;
  provinces: Province[];
};

export const moroccoRegions: MoroccoRegion[] = [
  {
    name: "Tanger-Tetouan-Al Hoceima",
    slug: "tanger-tetouan-al-hoceima",
    provinces: [
      { name: "Tanger-Assilah", slug: "tanger-assilah", communes: [{ name: "Tanger", slug: "tanger" }, { name: "Assilah", slug: "assilah" }] },
      { name: "Tetouan", slug: "tetouan", communes: [{ name: "Tetouan", slug: "tetouan" }, { name: "Martil", slug: "martil" }] },
      { name: "Al Hoceima", slug: "al-hoceima", communes: [{ name: "Al Hoceima", slug: "al-hoceima" }, { name: "Imzouren", slug: "imzouren" }] },
    ],
  },
  {
    name: "Oriental",
    slug: "oriental",
    provinces: [
      { name: "Oujda-Angad", slug: "oujda-angad", communes: [{ name: "Oujda", slug: "oujda" }, { name: "Bni Drar", slug: "bni-drar" }] },
      { name: "Nador", slug: "nador", communes: [{ name: "Nador", slug: "nador" }, { name: "Al Aaroui", slug: "al-aaroui" }] },
    ],
  },
  {
    name: "Fes-Meknes",
    slug: "fes-meknes",
    provinces: [
      { name: "Fes", slug: "fes", communes: [{ name: "Fes", slug: "fes" }, { name: "Sais", slug: "sais" }] },
      { name: "Meknes", slug: "meknes", communes: [{ name: "Meknes", slug: "meknes" }, { name: "Toulal", slug: "toulal" }] },
    ],
  },
  {
    name: "Rabat-Sale-Kenitra",
    slug: "rabat-sale-kenitra",
    provinces: [
      { name: "Rabat", slug: "rabat", communes: [{ name: "Rabat", slug: "rabat" }, { name: "Agdal-Ryad", slug: "agdal-ryad" }] },
      { name: "Kenitra", slug: "kenitra", communes: [{ name: "Kenitra", slug: "kenitra" }, { name: "Mehdya", slug: "mehdya" }] },
    ],
  },
  {
    name: "Beni Mellal-Khenifra",
    slug: "beni-mellal-khenifra",
    provinces: [
      { name: "Beni Mellal", slug: "beni-mellal", communes: [{ name: "Beni Mellal", slug: "beni-mellal" }, { name: "Fkih Ben Salah", slug: "fkih-ben-salah" }] },
      { name: "Khenifra", slug: "khenifra", communes: [{ name: "Khenifra", slug: "khenifra" }, { name: "M'Rirt", slug: "mrirt" }] },
    ],
  },
  {
    name: "Casablanca-Settat",
    slug: "casablanca-settat",
    provinces: [
      { name: "Casablanca", slug: "casablanca", communes: [{ name: "Maarif", slug: "maarif" }, { name: "Anfa", slug: "anfa" }] },
      { name: "Settat", slug: "settat", communes: [{ name: "Settat", slug: "settat" }, { name: "Berrechid", slug: "berrechid" }] },
    ],
  },
  {
    name: "Marrakech-Safi",
    slug: "marrakech-safi",
    provinces: [
      { name: "Marrakech", slug: "marrakech", communes: [{ name: "Gueliz", slug: "gueliz" }, { name: "Menara", slug: "menara" }] },
      { name: "Safi", slug: "safi", communes: [{ name: "Safi", slug: "safi" }, { name: "Youssoufia", slug: "youssoufia" }] },
    ],
  },
  {
    name: "Draa-Tafilalet",
    slug: "draa-tafilalet",
    provinces: [
      { name: "Errachidia", slug: "errachidia", communes: [{ name: "Errachidia", slug: "errachidia" }, { name: "Merzouga", slug: "merzouga" }] },
      { name: "Ouarzazate", slug: "ouarzazate", communes: [{ name: "Ouarzazate", slug: "ouarzazate" }, { name: "Taznakht", slug: "taznakht" }] },
    ],
  },
  {
    name: "Souss-Massa",
    slug: "souss-massa",
    provinces: [
      { name: "Agadir Ida-Outanane", slug: "agadir-ida-outanane", communes: [{ name: "Agadir", slug: "agadir" }, { name: "Aourir", slug: "aourir" }] },
      { name: "Taroudant", slug: "taroudant", communes: [{ name: "Taroudant", slug: "taroudant" }, { name: "Ouled Teima", slug: "ouled-teima" }] },
    ],
  },
  {
    name: "Guelmim-Oued Noun",
    slug: "guelmim-oued-noun",
    provinces: [
      { name: "Guelmim", slug: "guelmim", communes: [{ name: "Guelmim", slug: "guelmim" }, { name: "Taghjijt", slug: "taghjijt" }] },
      { name: "Sidi Ifni", slug: "sidi-ifni", communes: [{ name: "Sidi Ifni", slug: "sidi-ifni" }, { name: "Mirleft", slug: "mirleft" }] },
    ],
  },
  {
    name: "Laayoune-Sakia El Hamra",
    slug: "laayoune-sakia-el-hamra",
    provinces: [
      { name: "Laayoune", slug: "laayoune", communes: [{ name: "Laayoune", slug: "laayoune" }, { name: "El Marsa", slug: "el-marsa" }] },
      { name: "Tarfaya", slug: "tarfaya", communes: [{ name: "Tarfaya", slug: "tarfaya" }, { name: "Daoura", slug: "daoura" }] },
    ],
  },
  {
    name: "Dakhla-Oued Ed-Dahab",
    slug: "dakhla-oued-ed-dahab",
    provinces: [
      { name: "Oued Ed-Dahab", slug: "oued-ed-dahab", communes: [{ name: "Dakhla", slug: "dakhla" }, { name: "El Argoub", slug: "el-argoub" }] },
      { name: "Aousserd", slug: "aousserd", communes: [{ name: "Aousserd", slug: "aousserd" }, { name: "Bir Gandouz", slug: "bir-gandouz" }] },
    ],
  },
];

