import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// In-memory storage for feature flags (persists across requests during server lifetime)
// In production, this would be stored in a database
export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description?: string;
  status: "enabled" | "beta" | "disabled" | "canary";
  scope: "all" | "pro_team" | "staff" | "percentage";
  rolloutPercentage: number;
  isNew?: boolean;
  icon: string;
  iconColor: string;
  createdAt: string;
  updatedAt: string;
}

// Default feature flags
const defaultFlags: FeatureFlag[] = [
  {
    id: "1",
    name: "Messaging",
    key: "feat_messaging_v1",
    description: "Real-time messaging between athletes and recruiters",
    status: "enabled",
    scope: "all",
    rolloutPercentage: 100,
    icon: "chat",
    iconColor: "text-green-500 bg-green-500/10",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    name: "Film Upload",
    key: "feat_vid_upload_beta",
    description: "Video upload and processing for athlete highlights",
    status: "beta",
    scope: "pro_team",
    rolloutPercentage: 100,
    icon: "video_library",
    iconColor: "text-yellow-500 bg-yellow-500/10",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "3",
    name: "AI Scouting Reports",
    key: "feat_ai_reports_gen",
    description: "AI-powered scouting report generation",
    status: "disabled",
    scope: "staff",
    rolloutPercentage: 0,
    icon: "psychology",
    iconColor: "text-red-500 bg-red-500/10",
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Zone Map v2",
    key: "feat_zone_map_canary",
    description: "New interactive recruiting zone map",
    status: "canary",
    scope: "percentage",
    rolloutPercentage: 15,
    isNew: true,
    icon: "map",
    iconColor: "text-blue-500 bg-blue-500/10",
    createdAt: "2024-03-15T00:00:00Z",
    updatedAt: "2024-03-15T00:00:00Z",
  },
];

// In-memory store (simulates database)
const featureFlags: FeatureFlag[] = [...defaultFlags];

// GET /api/admin/feature-flags - Get all feature flags
export async function GET(request: NextRequest) {
  try {
    // Parse query params for filtering
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "all";

    let filteredFlags = [...featureFlags];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredFlags = filteredFlags.filter(
        (flag) =>
          flag.name.toLowerCase().includes(searchLower) ||
          flag.key.toLowerCase().includes(searchLower) ||
          flag.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filteredFlags = filteredFlags.filter(
          (flag) =>
            flag.status === "enabled" ||
            flag.status === "beta" ||
            flag.status === "canary"
        );
      } else if (statusFilter === "deprecated") {
        filteredFlags = filteredFlags.filter(
          (flag) => flag.status === "disabled"
        );
      } else {
        filteredFlags = filteredFlags.filter(
          (flag) => flag.status === statusFilter
        );
      }
    }

    // Sort by updatedAt descending
    filteredFlags.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json({
      flags: filteredFlags,
      total: featureFlags.length,
      filtered: filteredFlags.length,
    });
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature flags" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/feature-flags - Update a feature flag
const updateSchema = z.object({
  id: z.string(),
  status: z.enum(["enabled", "beta", "disabled", "canary"]).optional(),
  scope: z.enum(["all", "pro_team", "staff", "percentage"]).optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { id, status, scope, rolloutPercentage } = parsed.data;

    // Find the flag
    const flagIndex = featureFlags.findIndex((f) => f.id === id);
    if (flagIndex === -1) {
      return NextResponse.json(
        { error: "Feature flag not found" },
        { status: 404 }
      );
    }

    // Update the flag
    const updatedFlag = { ...featureFlags[flagIndex] };

    if (status !== undefined) {
      updatedFlag.status = status;
      // Auto-adjust rollout percentage based on status
      if (status === "enabled") {
        updatedFlag.rolloutPercentage = 100;
        updatedFlag.scope = "all";
      } else if (status === "disabled") {
        updatedFlag.rolloutPercentage = 0;
      }
    }

    if (scope !== undefined) {
      updatedFlag.scope = scope;
    }

    if (rolloutPercentage !== undefined) {
      updatedFlag.rolloutPercentage = rolloutPercentage;
      // If setting a specific percentage, set scope to percentage
      if (rolloutPercentage < 100 && rolloutPercentage > 0) {
        updatedFlag.scope = "percentage";
        if (updatedFlag.status === "enabled") {
          updatedFlag.status = "canary";
        }
      }
    }

    updatedFlag.updatedAt = new Date().toISOString();

    // Save the update
    featureFlags[flagIndex] = updatedFlag;

    return NextResponse.json({
      success: true,
      flag: updatedFlag,
    });
  } catch (error) {
    console.error("Error updating feature flag:", error);
    return NextResponse.json(
      { error: "Failed to update feature flag" },
      { status: 500 }
    );
  }
}

// POST /api/admin/feature-flags - Create a new feature flag
const createSchema = z.object({
  name: z.string().min(1),
  key: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["enabled", "beta", "disabled", "canary"]).default("disabled"),
  scope: z.enum(["all", "pro_team", "staff", "percentage"]).default("staff"),
  rolloutPercentage: z.number().min(0).max(100).default(0),
  icon: z.string().default("flag"),
  iconColor: z.string().default("text-gray-500 bg-gray-500/10"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check for duplicate key
    if (featureFlags.some((f) => f.key === parsed.data.key)) {
      return NextResponse.json(
        { error: "Feature flag with this key already exists" },
        { status: 409 }
      );
    }

    const newFlag: FeatureFlag = {
      id: String(Date.now()),
      ...parsed.data,
      isNew: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    featureFlags.unshift(newFlag);

    return NextResponse.json({
      success: true,
      flag: newFlag,
    });
  } catch (error) {
    console.error("Error creating feature flag:", error);
    return NextResponse.json(
      { error: "Failed to create feature flag" },
      { status: 500 }
    );
  }
}
