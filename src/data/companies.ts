import type { ReviewChip } from "@/types";

function logo(slug: string): string {
  return `/logos/${slug}.svg`;
}

export const COMPANIES = {
  lumenfold: { name: "Lumenfold", logoUrl: logo("lumenfold") },
  parcelHarbor: { name: "Parcel Harbor", logoUrl: logo("parcelharbor") },
  quillstack: { name: "Quillstack", logoUrl: logo("quillstack") },
  tessellate: { name: "Tessellate", logoUrl: logo("tessellate") },
  brightloom: { name: "Brightloom Studio", logoUrl: logo("brightloom") },
  kestrelPay: { name: "Kestrel Pay", logoUrl: logo("kestrelpay") },
  orbitly: { name: "Orbitly", logoUrl: logo("orbitly") },
  fernhill: { name: "Fernhill Robotics", logoUrl: logo("fernhill") },
  cobaltFreight: { name: "Cobalt Freight", logoUrl: logo("cobaltfreight") },
  mosaicHealth: { name: "Mosaic Health", logoUrl: logo("mosaichealth") },
  driftwood: { name: "Driftwood AI", logoUrl: logo("driftwood") },
  halcyonBank: { name: "Halcyon Bank", logoUrl: logo("halcyonbank") },
  pinecrest: { name: "Pinecrest Analytics", logoUrl: logo("pinecrest") },
  vantle: { name: "Vantle", logoUrl: logo("vantle") },
  sundial: { name: "Sundial Energy", logoUrl: logo("sundial") },
  noLogo: { name: "Stealth Startup", logoUrl: null },
  brokenLogo: { name: "Glasswing Labs", logoUrl: "/logos/glasswing-labs-missing.svg" },
  veryLongName: {
    name: "The International Consortium for Applied Distributed Systems Research GmbH & Co. KG",
    logoUrl: null,
  },
} satisfies Record<string, ReviewChip>;

export const SCHOOLS = {
  tum: { name: "Technical University of Munich", logoUrl: logo("tumunich") },
  eth: { name: "ETH Zürich", logoUrl: logo("ethz") },
  ucl: { name: "University College London", logoUrl: logo("ucl") },
  kth: { name: "KTH Royal Institute of Technology", logoUrl: logo("kth") },
  tsinghua: { name: "Tsinghua University", logoUrl: logo("tsinghua") },
  epfl: { name: "EPFL", logoUrl: logo("epfl") },
  delft: { name: "TU Delft", logoUrl: logo("tudelft") },
  bootcamp: { name: "Self-taught", logoUrl: null },
} satisfies Record<string, ReviewChip>;
