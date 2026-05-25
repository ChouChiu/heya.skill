/**
 * uapi.ts — UAPI (uapis.cn) 第三方 B站 API 客户端
 * 使用官方 SDK `uapi-sdk-typescript`，免费额度，无需 Token
 */

import pRetry from "p-retry";
import { UapiClient } from "uapi-sdk-typescript";
import type { VideoEntry } from "./types.ts";
import { sleep } from "./utils.ts";

// B站 UID（mid）
export const UID = "3706929260006322";

const PAGE_SIZE = 50;
const client = new UapiClient("https://uapis.cn");

/** 获取单页 */
function fetchPage(page: number) {
  return client.social.getSocialBilibiliArchives({
    mid: UID,
    ps: String(PAGE_SIZE),
    pn: String(page),
    orderby: "pubdate",
    disableCache: page > 1,
  });
}

/** 将 UAPI 视频条目映射为 VideoEntry */
function mapToVideoEntry(v: {
  aid?: number;
  bvid?: string;
  title?: string;
  publish_time?: number;
}): VideoEntry {
  const created = v.publish_time ?? 0;
  return {
    bvid: v.bvid ?? "",
    aid: v.aid ?? 0,
    title: v.title ?? "",
    created,
    createdDate: created
      ? new Date(created * 1000).toISOString().split("T")[0]
      : "",
  };
}

/** 通过 UAPI 分页获取所有视频 */
export async function fetchAllVideosFromUapi(): Promise<VideoEntry[]> {
  console.log(`🚀 开始通过 UAPI 获取博主 ${UID} 的视频列表...\n`);

  const firstPage = await pRetry(() => fetchPage(1), {
    retries: 3,
    minTimeout: 1000,
    factor: 2,
    maxTimeout: 8000,
    onFailedAttempt: (err) =>
      console.error(
        `  ⚠️ UAPI 第一页请求 失败 (${err.attemptNumber}/${err.retriesLeft + err.attemptNumber})，${Math.min(err.attemptNumber * 1000, 8000) / 1000}s 后重试...`,
      ),
  });

  const totalCount = firstPage.total ?? 0;
  console.log(`📊 共 ${totalCount} 个视频`);

  const allVideos: VideoEntry[] = (firstPage.videos ?? []).map(mapToVideoEntry);
  console.log(`  ✅ 第 1 页: ${firstPage.videos?.length ?? 0} 个视频`);

  let page = 2;
  while (allVideos.length < totalCount) {
    await sleep(1500);

    try {
      const pageData = await fetchPage(page);
      const videos = pageData.videos ?? [];
      if (videos.length === 0) break; // UAPI total 可能大于实际可返回数
      allVideos.push(...videos.map(mapToVideoEntry));
      console.log(`  ✅ 第 ${page} 页: ${videos.length} 个视频`);
    } catch (err) {
      console.error(
        `  ❌ 第 ${page} 页失败: ${(err as Error)?.message ?? String(err)}`,
      );
      await sleep(3000);
    }

    page++;
  }

  console.log(`\n📹 已收集 ${allVideos.length} 个视频标题 (via UAPI)\n`);
  return allVideos;
}
