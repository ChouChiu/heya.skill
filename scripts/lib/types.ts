// ============================================================
// 共用类型定义 — 被 fetch-bilibili-titles / analyze-titles / update-skill 复用
// ============================================================

// ---- 视频条目（采集结果） ----

export interface VideoEntry {
  bvid: string;
  aid: number;
  title: string;
  created: number;
  createdDate: string;
}

// ---- Pipeline 步骤 ----

export interface PipelineStep {
  id: "fetch" | "analyze" | "update";
  script: string;
  label: string;
}

// ---- 分析输出 (02-style-analysis.json) ----

export interface CategoryInfo {
  frequency: number;
  count: number;
  pctDisplay: string;
  examples: string[];
  templates: string[];
}

export interface KeywordEntry {
  word: string;
  count: number;
}

export interface NumberEntry {
  number: number;
  count: number;
}

export interface AnalysisData {
  meta: {
    creator: string;
    uid: string;
    totalVideos: number;
    analysisDate: string;
  };
  patterns: {
    structure: Record<string, CategoryInfo>;
  };
  keywords: {
    emotion: KeywordEntry[];
    aiTerms: KeywordEntry[];
    highFrequency: KeywordEntry[];
    uniqueExpressions: string[];
  };
  sentencePatterns: {
    question: number;
    exclamation: number;
    statement: number;
  };
  length: {
    avg: number;
    min: number;
    max: number;
    median: number;
    distribution: Record<string, number>;
    over40Pct: number;
    optimal: { min: number; max: number };
  };
  numbers: {
    withNumberPct: number;
    commonNumbers: NumberEntry[];
  };
  punctuation: {
    exclamationEnd: number;
    questionEnd: number;
    ellipsisEnd: number;
  };
  aiDaily: {
    count: number;
    pct: number;
  };
}

// ---- 标题条目（analyze 输入，VideoEntry 的 title 视图） ----

export interface TitleEntry {
  title: string;
}

// ---- 预计算分析结果（避免 report / json 重复计算） ----

export interface AnalysisResults {
  total: number;
  lengthStats: {
    avg: string;
    min: number;
    max: number;
    median: number;
    distribution: Record<string, number>;
  };
  numberStats: {
    withNumberPct: string;
    commonNumbers: [string, number][];
  };
  topWords: [string, number][];
  categories: Record<string, string[]>;
  punctStats: {
    endsQuestion: number;
    endsExclamation: number;
    endsEllipsis: number;
    hasAngleBracket: number;
    hasEmoji: number;
  };
  emotionWords: [string, number][];
  aiTerms: [string, number][];
  aiDaily: {
    withAIDaily: number;
    withAIDailyPct: string;
  };
}
