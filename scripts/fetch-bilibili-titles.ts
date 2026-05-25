#!/usr/bin/env bun
/**
 * fetch-bilibili-titles.ts
 * 从B站获取博主"黑鸦"的所有视频标题
 * 支持 WBI 签名
 *
 * 用法:
 *   bun run scripts/fetch-bilibili-titles.ts
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fetchAllVideos } from "./lib/bilibili.ts";
import type { VideoEntry } from "./lib/types.ts";

const OUTPUT_DIR = join(import.meta.dir, "../references/research");
const TITLES_PATH = join(OUTPUT_DIR, "01-titles.json");

/** 从已有数据中获取最新视频的 created 时间戳 */
function loadLatestCreated(filepath: string): number | undefined {
  if (!existsSync(filepath)) return undefined;

  let existing: VideoEntry[];
  try {
    existing = JSON.parse(readFileSync(filepath, "utf-8"));
  } catch {
    return undefined;
  }

  if (!Array.isArray(existing) || existing.length === 0) return undefined;

  // 取最大 created（最新视频）
  let max = existing[0].created;
  for (const v of existing) {
    if (v.created > max) max = v.created;
  }
  return max;
}

/** 读已有数据 */
function loadExisting(filepath: string): VideoEntry[] {
  if (!existsSync(filepath)) return [];
  try {
    const data = JSON.parse(readFileSync(filepath, "utf-8"));
    if (!Array.isArray(data)) return [];
    return data as VideoEntry[];
  } catch {
    return [];
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log("从B站获取博主「黑鸦」的视频标题（增量更新）\n");
    console.log("用法:");
    console.log("  bun run scripts/fetch-bilibili-titles.ts");
    console.log(
      "  bun run scripts/fetch-bilibili-titles.ts --full  # 全量拉取",
    );
    process.exit(0);
  }

  const forceFull = args.includes("--full");

  // 确定增量起点
  let since: number | undefined;
  if (!forceFull) {
    since = loadLatestCreated(TITLES_PATH);
    if (since) {
      const dateStr = new Date(since * 1000).toISOString().split("T")[0];
      console.log(
        `📦 已有 ${loadExisting(TITLES_PATH).length} 条数据，最新: ${dateStr}`,
      );
      console.log("📥 增量模式：只拉取之后的新视频\n");
    } else {
      console.log("📦 无已有数据，全量拉取\n");
    }
  } else {
    console.log("📥 --full 模式：全量拉取\n");
  }

  let newVideos: Awaited<ReturnType<typeof fetchAllVideos>>;
  try {
    newVideos = await fetchAllVideos(since);
  } catch (err) {
    console.error(`\n❌ 获取失败: ${(err as Error).message}`);

    // 降级：如果有旧数据就用旧的，避免 pipeline 全崩
    if (existsSync(TITLES_PATH)) {
      const existing = JSON.parse(readFileSync(TITLES_PATH, "utf-8"));
      console.error(
        `⚠️  降级使用缓存数据（${existing.length} 条标题），可能不是最新`,
      );
      newVideos = [];
      // merge 阶段会用 existing 兜底
    } else {
      console.error("💥 无缓存数据可用，退出");
      process.exit(1);
    }
  }

  // 合并新旧数据：新视频在前，旧数据在后
  const existing = loadExisting(TITLES_PATH);
  const merged = [...newVideos, ...existing];

  // 去重（按 bvid）—— 安全网
  const seen = new Set<string>();
  const deduped: VideoEntry[] = [];
  for (const v of merged) {
    if (!seen.has(v.bvid)) {
      seen.add(v.bvid);
      deduped.push(v);
    }
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(TITLES_PATH, JSON.stringify(deduped, null, 2), "utf-8");

  console.log("\n✨ 完成！");
  console.log(`  🆕 新增: ${newVideos.length} 个视频`);
  console.log(`  📹 总计: ${deduped.length} 个视频`);
  console.log("  💾 数据已保存到 references/research/01-titles.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
