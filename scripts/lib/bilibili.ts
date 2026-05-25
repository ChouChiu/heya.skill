import { createHash } from "node:crypto";
import type {
  BilibiliNavResponse,
  BilibiliSearchResponse,
  BilibiliVideoItem,
  VideoEntry,
  WbiKeys,
} from "./types.ts";
import { COOKIE, sleep } from "./utils.ts";

export const UID = "3706929260006322";
const WBI_URL = "https://api.bilibili.com/x/web-interface/nav";
export const SEARCH_URL = "https://api.bilibili.com/x/space/wbi/arc/search";
export const PAGE_SIZE = 50;

// WBI 混淆表
const MIXIN_KEY_ENC_TAB = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61,
  26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36,
  20, 34, 44, 52,
];

/** 构建请求头 */
export function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Referer: `https://space.bilibili.com/${UID}`,
  };
  if (COOKIE) {
    headers["Cookie"] = COOKIE;
  }
  return headers;
}

/** 获取 WBI 签名密钥 */
export async function getWbiKeys(): Promise<WbiKeys> {
  const resp = await fetch(WBI_URL, { headers: buildHeaders() });
  const json = (await resp.json()) as BilibiliNavResponse;
  const { wbi_img } = json.data;
  return {
    img: wbi_img.img_url.split("/").pop()?.split(".")[0],
    sub: wbi_img.sub_url.split("/").pop()?.split(".")[0],
  };
}

/** 生成 mixin_key */
function getMixinKey(orig: string): string {
  return MIXIN_KEY_ENC_TAB.map((n) => orig[n])
    .join("")
    .slice(0, 32);
}

/** MD5 哈希（用于 WBI 签名） */
function md5(str: string): string {
  return createHash("md5").update(str).digest("hex");
}

/** WBI 签名 */
export function encWbi(
  params: Record<string, string | number | boolean>,
  imgKey: string,
  subKey: string,
): string {
  const mixinKey = getMixinKey(imgKey + subKey);
  const wts = Math.round(Date.now() / 1000);
  const signedParams = { ...params, wts };

  const query = Object.keys(signedParams)
    .sort()
    .map((key) => `${key}=${encodeURIComponent(String(signedParams[key]))}`)
    .join("&");

  const wbiSign = md5(query + mixinKey);
  return `${query}&w_rid=${wbiSign}`;
}

/** 重试 + 指数退避 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries = 3,
): Promise<T> {
  let lastErr: Error | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err as Error;
      if (i < maxRetries - 1) {
        const wait = Math.min(1000 * 2 ** i, 8000);
        console.error(
          `  ⚠️ ${label} 失败 (${i + 1}/${maxRetries})，${wait / 1000}s 后重试...`,
        );
        await sleep(wait);
      }
    }
  }
  throw new Error(`${label}: ${lastErr?.message}`);
}

/** 获取视频列表（单页，带 WBI 签名） */
export async function fetchVideoPage(
  page: number,
  imgKey: string,
  subKey: string,
) {
  const params = {
    mid: UID,
    ps: PAGE_SIZE,
    pn: page,
    order: "pubdate",
    tid: 0,
    keyword: "",
    platform: "web",
    web_location: "1550101",
    order_avoided: true,
  };

  const query = encWbi(params, imgKey, subKey);
  const url = `${SEARCH_URL}?${query}`;

  const response = await fetch(url, { headers: buildHeaders() });

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} ${response.statusText} from ${SEARCH_URL}`,
    );
  }

  let data: BilibiliSearchResponse;
  try {
    data = (await response.json()) as BilibiliSearchResponse;
  } catch (_err) {
    const body = await response.text().catch(() => "<unreadable>");
    throw new Error(
      `JSON parse failed (HTTP ${response.status}): ${body.slice(0, 300)}`,
    );
  }

  if (data.code !== 0) {
    throw new Error(`API error: ${data.message} (code: ${data.code})`);
  }

  return data.data;
}

/** 从 BilibiliVideoItem 构建 VideoEntry */
export function buildVideoEntry(video: BilibiliVideoItem): VideoEntry {
  return {
    bvid: video.bvid,
    aid: video.aid,
    title: video.title,
    created: video.created,
    createdDate: new Date(video.created * 1000).toISOString().split("T")[0],
  };
}

/** 分页获取所有视频 */
export async function fetchAllVideos(): Promise<VideoEntry[]> {
  console.log(`🚀 开始获取博主 ${UID} 的视频列表...\n`);

  console.log("🔑 获取 WBI 签名密钥...");
  const { img, sub } = await getWbiKeys();
  console.log("  ✅ 密钥获取成功\n");

  const allVideos: BilibiliVideoItem[] = [];
  let page = 1;
  let totalCount = 0;

  // 第一页获取总数（带重试，B 站 API 概率性抽风）
  const firstPage = await withRetry(
    () => fetchVideoPage(page, img, sub),
    "第一页请求",
  );
  totalCount = firstPage.page.count;
  console.log(`📊 共 ${totalCount} 个视频`);

  for (const video of firstPage.list.vlist) {
    allVideos.push(video);
  }
  console.log(`  ✅ 第 ${page} 页: ${firstPage.list.vlist.length} 个视频`);
  page++;

  // 获取剩余页
  while (allVideos.length < totalCount) {
    await sleep(1500);
    try {
      const pageData = await fetchVideoPage(page, img, sub);
      for (const video of pageData.list.vlist) {
        allVideos.push(video);
      }
      console.log(`  ✅ 第 ${page} 页: ${pageData.list.vlist.length} 个视频`);
    } catch (err) {
      console.error(`  ❌ 第 ${page} 页失败: ${(err as Error).message}`);
      await sleep(3000);
      continue;
    }
    page++;
  }

  const results: VideoEntry[] = allVideos.map(buildVideoEntry);
  console.log(`\n📹 已收集 ${results.length} 个视频标题\n`);

  return results;
}
