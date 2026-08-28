export interface IntelligentTheme {
  glowColor: string;
  gradient: string;
  accent: string;
  tagBg: string;
}

export function getIntelligentTheme(
  categoryName?: string | null,
  productName?: string | null
): IntelligentTheme {
  const cat = (categoryName || "").toLowerCase();
  const name = (productName || "").toLowerCase();

  if (name.includes("solgar")) {
    return {
      glowColor: "rgba(234, 179, 8, 0.32)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(234, 179, 8, 0.4) 0%, rgba(180, 83, 9, 0.16) 55%, transparent 75%)",
      accent: "#b45309",
      tagBg: "rgba(234, 179, 8, 0.16)",
    };
  } else if (name.includes("womenli")) {
    return {
      glowColor: "rgba(34, 197, 94, 0.28)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(34, 197, 94, 0.35) 0%, rgba(234, 179, 8, 0.14) 55%, transparent 75%)",
      accent: "#15803d",
      tagBg: "rgba(34, 197, 94, 0.14)",
    };
  } else if (name.includes("veet")) {
    return {
      glowColor: "rgba(236, 72, 153, 0.28)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(236, 72, 153, 0.35) 0%, rgba(168, 85, 247, 0.14) 55%, transparent 75%)",
      accent: "#db2777",
      tagBg: "rgba(236, 72, 153, 0.14)",
    };
  } else if (name.includes("easylife")) {
    return {
      glowColor: "rgba(234, 179, 8, 0.28)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(234, 179, 8, 0.35) 0%, rgba(249, 115, 22, 0.14) 55%, transparent 75%)",
      accent: "#ca8a04",
      tagBg: "rgba(234, 179, 8, 0.14)",
    };
  } else if (name.includes("vaseline")) {
    return {
      glowColor: "rgba(29, 78, 216, 0.28)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(29, 78, 216, 0.35) 0%, rgba(245, 158, 11, 0.14) 55%, transparent 75%)",
      accent: "#1d4ed8",
      tagBg: "rgba(29, 78, 216, 0.14)",
    };
  } else if (name.includes("uro")) {
    return {
      glowColor: "rgba(244, 114, 182, 0.28)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(244, 114, 182, 0.35) 0%, rgba(236, 72, 153, 0.14) 55%, transparent 75%)",
      accent: "#e11d48",
      tagBg: "rgba(244, 114, 182, 0.14)",
    };
  } else if (name.includes("simple")) {
    return {
      glowColor: "rgba(34, 197, 94, 0.28)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(34, 197, 94, 0.35) 0%, rgba(14, 165, 233, 0.14) 55%, transparent 75%)",
      accent: "#16a34a",
      tagBg: "rgba(34, 197, 94, 0.14)",
    };
  } else if (name.includes("zazzee")) {
    return {
      glowColor: "rgba(236, 72, 153, 0.28)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(236, 72, 153, 0.35) 0%, rgba(16, 185, 129, 0.14) 55%, transparent 75%)",
      accent: "#db2777",
      tagBg: "rgba(236, 72, 153, 0.14)",
    };
  } else if (name.includes("tomatine")) {
    return {
      glowColor: "rgba(239, 68, 68, 0.28)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(239, 68, 68, 0.35) 0%, rgba(245, 158, 11, 0.14) 55%, transparent 75%)",
      accent: "#dc2626",
      tagBg: "rgba(239, 68, 68, 0.14)",
    };
  } else if (name.includes("vitabiotics")) {
    return {
      glowColor: "rgba(249, 115, 22, 0.28)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(249, 115, 22, 0.35) 0%, rgba(234, 179, 8, 0.14) 55%, transparent 75%)",
      accent: "#ea580c",
      tagBg: "rgba(249, 115, 22, 0.14)",
    };
  } else if (name.includes("palmer") || name.includes("cocoa butter")) {
    return {
      glowColor: "rgba(217, 119, 6, 0.28)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(217, 119, 6, 0.35) 0%, rgba(244, 114, 182, 0.14) 55%, transparent 75%)",
      accent: "#b45309",
      tagBg: "rgba(217, 119, 6, 0.14)",
    };
  } else if (name.includes("olay")) {
    return {
      glowColor: "rgba(245, 158, 11, 0.28)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(245, 158, 11, 0.35) 0%, rgba(244, 114, 182, 0.14) 55%, transparent 75%)",
      accent: "#d97706",
      tagBg: "rgba(245, 158, 11, 0.14)",
    };
  } else if (name.includes("cerave")) {
    return {
      glowColor: "rgba(2, 132, 199, 0.25)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(2, 132, 199, 0.3) 0%, rgba(56, 189, 248, 0.12) 55%, transparent 75%)",
      accent: "#0284c7",
      tagBg: "rgba(2, 132, 199, 0.14)",
    };
  } else if (name.includes("cetaphil") || name.includes("amlactin")) {
    return {
      glowColor: "rgba(16, 185, 129, 0.25)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(16, 185, 129, 0.3) 0%, rgba(20, 184, 166, 0.12) 55%, transparent 75%)",
      accent: "#059669",
      tagBg: "rgba(16, 185, 129, 0.14)",
    };
  } else if (name.includes("now ") || name.includes("now-")) {
    return {
      glowColor: "rgba(249, 115, 22, 0.25)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(249, 115, 22, 0.3) 0%, rgba(234, 88, 12, 0.12) 55%, transparent 75%)",
      accent: "#ea580c",
      tagBg: "rgba(249, 115, 22, 0.14)",
    };
  } else if (name.includes("21st century") || name.includes("century")) {
    return {
      glowColor: "rgba(20, 184, 166, 0.25)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(20, 184, 166, 0.3) 0%, rgba(14, 165, 233, 0.12) 55%, transparent 75%)",
      accent: "#0d9488",
      tagBg: "rgba(20, 184, 166, 0.14)",
    };
  } else if (name.includes("double wood")) {
    return {
      glowColor: "rgba(217, 119, 6, 0.25)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(217, 119, 6, 0.3) 0%, rgba(180, 83, 9, 0.12) 55%, transparent 75%)",
      accent: "#b45309",
      tagBg: "rgba(217, 119, 6, 0.14)",
    };
  } else if (
    cat.includes("beauty") ||
    cat.includes("skin") ||
    cat.includes("cosmetic")
  ) {
    return {
      glowColor: "rgba(16, 185, 129, 0.22)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(16, 185, 129, 0.25) 0%, rgba(20, 184, 166, 0.08) 55%, transparent 75%)",
      accent: "#10b981",
      tagBg: "rgba(16, 185, 129, 0.12)",
    };
  } else if (cat.includes("vitamin") || cat.includes("supplement")) {
    return {
      glowColor: "rgba(245, 158, 11, 0.22)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(239, 68, 68, 0.22) 0%, rgba(245, 158, 11, 0.1) 55%, transparent 75%)",
      accent: "#e11d48",
      tagBg: "rgba(239, 68, 68, 0.12)",
    };
  } else if (cat.includes("protein") || cat.includes("sport")) {
    return {
      glowColor: "rgba(14, 165, 233, 0.22)",
      gradient:
        "radial-gradient(circle at 50% 40%, rgba(14, 165, 233, 0.25) 0%, rgba(99, 102, 241, 0.08) 55%, transparent 75%)",
      accent: "#0284c7",
      tagBg: "rgba(14, 165, 233, 0.12)",
    };
  }

  return {
    glowColor: "rgba(14, 107, 79, 0.18)",
    gradient:
      "radial-gradient(circle at 50% 40%, rgba(14, 107, 79, 0.22) 0%, rgba(201, 162, 75, 0.1) 55%, transparent 75%)",
    accent: "#0E6B4F",
    tagBg: "rgba(14, 107, 79, 0.12)",
  };
}
