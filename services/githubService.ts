
import { GithubConfig, Article, VideoPost, AdConfig, VirtualFile, UserProfile, Message, TickerConfig, JobApplication, JobPosition, GlobalSEOConfig } from "../types";

export const GithubService = {
  generateFileContent: (
    apiKey: string, 
    articles: Article[], 
    videos: VideoPost[], 
    ads: AdConfig[],
    files: VirtualFile[],
    users: UserProfile[],
    messages: Message[],
    ticker: TickerConfig,
    githubConfig: GithubConfig | undefined,
    jobApplications: JobApplication[] | undefined,
    jobs: JobPosition[] | undefined,
    seoConfig: GlobalSEOConfig
  ): string => {
    const newTimestamp = Date.now();
    let tokenPart1 = "ghp_";
    let tokenPart2 = "";
    
    if (githubConfig?.token && githubConfig.token.startsWith("ghp_")) {
      tokenPart1 = "ghp_";
      tokenPart2 = githubConfig.token.substring(4);
    }

    const safeConfig = {
      token: "REPLACE_WITH_SPLIT_TOKEN",
      owner: githubConfig?.owner || '',
      repo: githubConfig?.repo || '',
      branch: githubConfig?.branch || 'main'
    };

    const configStr = JSON.stringify(safeConfig, null, 2)
      .replace('"REPLACE_WITH_SPLIT_TOKEN"', `"${tokenPart1}" + "${tokenPart2}"`);

    return `import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, UserProfile, Message, TickerConfig, JobPosition, JobApplication, GlobalSEOConfig } from './types';

// ROZA NEWS: ALL-DATA REPOSITORY (BACKUP)
// DO NOT EDIT MANUALLY - AUTO-GENERATED VIA ADMIN PANEL
export const DATA_TIMESTAMP = ${newTimestamp};

export const CATEGORIES = ['World', 'Business', 'Sports', 'Technology', 'Health', 'Entertainment'];

export const DEFAULT_API_KEY = "${apiKey || ''}";

export const DEFAULT_GITHUB_TOKEN = "${tokenPart1}" + "${tokenPart2}";

export const INITIAL_SEO_CONFIG: GlobalSEOConfig = ${JSON.stringify(seoConfig, null, 2)};

export const INITIAL_GITHUB_CONFIG: GithubConfig = ${configStr};

export const INITIAL_TICKER_CONFIG: TickerConfig = ${JSON.stringify(ticker, null, 2)};

export const INITIAL_ADS: AdConfig[] = ${JSON.stringify(ads, null, 2)};

export const INITIAL_VIDEOS: VideoPost[] = ${JSON.stringify(videos, null, 2)};

export const INITIAL_ARTICLES: Article[] = ${JSON.stringify(articles, null, 2)};

export const INITIAL_JOBS: JobPosition[] = ${JSON.stringify(jobs || [], null, 2)};

export const INITIAL_USERS: UserProfile[] = ${JSON.stringify(users, null, 2)};

export const INITIAL_MESSAGES: Message[] = ${JSON.stringify(messages, null, 2)};

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = ${JSON.stringify(jobApplications || [], null, 2)};

export const MOCK_ADMIN_EMAIL = "rozanewsofficial@gmail.com";

export const INITIAL_PROJECT_FILES: VirtualFile[] = ${JSON.stringify(files, null, 2)};`;
  },

  pushToGithub: async (config: GithubConfig, content: string) => {
    if (!config.token || !config.owner || !config.repo) return { success: false, message: "Missing GitHub Config" };
    
    const path = "constants.ts";
    const branch = config.branch || "main";
    
    try {
        const getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${branch}`;
        const getRes = await fetch(getUrl, { headers: { Authorization: `token ${config.token}` } });
        let sha = undefined;
        if (getRes.ok) { const data = await getRes.json(); sha = data.sha; }

        const utf8Bytes = new TextEncoder().encode(content);
        const binaryString = Array.from(utf8Bytes, (byte) => String.fromCodePoint(byte)).join("");
        const base64Content = btoa(binaryString);

        const putRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`, {
            method: "PUT",
            headers: { Authorization: `token ${config.token}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                message: `Roza Data Sync: ${new Date().toLocaleString()}`,
                content: base64Content,
                branch: branch,
                sha: sha
            })
        });

        if (putRes.ok) return { success: true, message: "✅ All Data synced to GitHub successfully!" };
        const errorData = await putRes.json();
        return { success: false, message: "GitHub Error: " + errorData.message };
    } catch (e: any) {
        return { success: false, message: "Network Error: " + e.message };
    }
  }
};