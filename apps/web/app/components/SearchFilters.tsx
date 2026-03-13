"use client";

import { useState } from "react";

const CATEGORIES = [
  "Tanakh",
  "Mishnah",
  "Talmud",
  "Midrash",
  "Halakhah",
  "Kabbalah",
  "Mussar",
  "Philosophy",
  "Liturgy",
  "Commentary",
];

const ERAS = [
  { value: "Tanna", label: "Tannaitic" },
  { value: "Amora", label: "Amoraic" },
  { value: "Gaon", label: "Geonic" },
  { value: "Rishon", label: "Rishonim" },
  { value: "Acharon", label: "Acharonim" },
  { value: "Modern", label: "Modern" },
  { value: "Second Temple", label: "Second Temple" },
];

const COMMUNITIES = [
  "General",
  "Ashkenazi",
  "Sephardi",
  "Mizrachi",
  "Yemenite",
  "Chassidic",
  "Lithuanian",
  "Italian",
  "Ethiopian",
];

export interface SearchFilterValues {
  work: string;
  category: string;
  era: string;
  community: string;
  author: string;
}

interface SearchFiltersProps {
  filters: SearchFilterValues;
  onChange: (filters: SearchFilterValues) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function SearchFilters({
  filters,
  onChange,
  collapsed = false,
  onToggleCollapse,
}: SearchFiltersProps) {
  const update = (key: keyof SearchFilterValues, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const activeCount = Object.values(filters).filter((v) => v.length > 0).length;

  const clearAll = () => {
    onChange({ work: "", category: "", era: "", community: "", author: "" });
  };

  return (
    <div className="search-filters-panel glass-card" style={{ padding: 16 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: collapsed ? 0 : 16,
          cursor: onToggleCollapse ? "pointer" : "default",
        }}
        onClick={onToggleCollapse}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Filters
          </span>
          {activeCount > 0 && (
            <span className="search-filter-badge">{activeCount}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {activeCount > 0 && (
            <button
              className="search-filter-clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
            >
              Clear all
            </button>
          )}
          {onToggleCollapse && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
      </div>

      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Work filter */}
          <div>
            <label className="search-filter-label">Work Name</label>
            <input
              type="text"
              placeholder="e.g., Mishnah Berurah"
              value={filters.work}
              onChange={(e) => update("work", e.target.value)}
              className="input-field"
              style={{ padding: "8px 12px", fontSize: 13 }}
            />
          </div>

          {/* Author filter */}
          <div>
            <label className="search-filter-label">Author</label>
            <input
              type="text"
              placeholder="e.g., Rambam, Rashi"
              value={filters.author}
              onChange={(e) => update("author", e.target.value)}
              className="input-field"
              style={{ padding: "8px 12px", fontSize: 13 }}
            />
          </div>

          {/* Category filter */}
          <div>
            <label className="search-filter-label">Category</label>
            <select
              value={filters.category}
              onChange={(e) => update("category", e.target.value)}
              className="select-field"
              style={{ width: "100%" }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Era filter */}
          <div>
            <label className="search-filter-label">Era</label>
            <select
              value={filters.era}
              onChange={(e) => update("era", e.target.value)}
              className="select-field"
              style={{ width: "100%" }}
            >
              <option value="">All Eras</option>
              {ERAS.map((era) => (
                <option key={era.value} value={era.value}>
                  {era.label}
                </option>
              ))}
            </select>
          </div>

          {/* Community filter */}
          <div>
            <label className="search-filter-label">Community</label>
            <select
              value={filters.community}
              onChange={(e) => update("community", e.target.value)}
              className="select-field"
              style={{ width: "100%" }}
            >
              <option value="">All Communities</option>
              {COMMUNITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
