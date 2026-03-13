import { NextRequest, NextResponse } from "next/server";

interface RelationshipEntry {
  from: { id: number; name: string };
  to: { id: number; name: string };
  type: "teacher" | "student" | "colleague";
}

// Mock relationship data keyed by rabbi_id
// Uses realistic historical teacher-student relationships
const MOCK_RELATIONSHIPS: Record<number, RelationshipEntry[]> = {
  // Rashi (assumed id=1)
  1: [
    { from: { id: 100, name: "Rabbeinu Gershom" }, to: { id: 1, name: "Rashi" }, type: "teacher" },
    { from: { id: 101, name: "Yaakov ben Yakar" }, to: { id: 1, name: "Rashi" }, type: "teacher" },
    { from: { id: 1, name: "Rashi" }, to: { id: 2, name: "Rashbam" }, type: "student" },
    { from: { id: 1, name: "Rashi" }, to: { id: 3, name: "Rabbeinu Tam" }, type: "student" },
    { from: { id: 1, name: "Rashi" }, to: { id: 102, name: "Shemaiah" }, type: "student" },
    { from: { id: 2, name: "Rashbam" }, to: { id: 3, name: "Rabbeinu Tam" }, type: "colleague" },
  ],
  // Rambam (assumed id=4)
  4: [
    { from: { id: 103, name: "Rabbeinu Maimon" }, to: { id: 4, name: "Rambam" }, type: "teacher" },
    { from: { id: 104, name: "Ibn Migash (indirect)" }, to: { id: 4, name: "Rambam" }, type: "teacher" },
    { from: { id: 4, name: "Rambam" }, to: { id: 5, name: "Avraham ben HaRambam" }, type: "student" },
    { from: { id: 4, name: "Rambam" }, to: { id: 105, name: "Yosef ibn Aknin" }, type: "student" },
    { from: { id: 4, name: "Rambam" }, to: { id: 106, name: "Raavad" }, type: "colleague" },
  ],
};

// Default relationships for any rabbi not in the map
function getDefaultRelationships(rabbiId: number): RelationshipEntry[] {
  return [
    { from: { id: 900, name: "Unknown Teacher" }, to: { id: rabbiId, name: "Selected Rabbi" }, type: "teacher" },
    { from: { id: rabbiId, name: "Selected Rabbi" }, to: { id: 901, name: "Notable Student A" }, type: "student" },
    { from: { id: rabbiId, name: "Selected Rabbi" }, to: { id: 902, name: "Notable Student B" }, type: "student" },
    { from: { id: rabbiId, name: "Selected Rabbi" }, to: { id: 903, name: "Contemporary Colleague" }, type: "colleague" },
  ];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rabbiIdStr = searchParams.get("rabbi_id");

  if (!rabbiIdStr) {
    return NextResponse.json({ error: "rabbi_id is required" }, { status: 400 });
  }

  const rabbiId = parseInt(rabbiIdStr, 10);
  if (isNaN(rabbiId)) {
    return NextResponse.json({ error: "rabbi_id must be a number" }, { status: 400 });
  }

  const relationships = MOCK_RELATIONSHIPS[rabbiId] || getDefaultRelationships(rabbiId);

  return NextResponse.json({ relationships });
}
