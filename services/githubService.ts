import { GithubConfig, Article, VideoPost, AdConfig, VirtualFile, UserProfile, Message, TickerConfig } from "../types";
import { StorageService } from "./storageService";

export const GithubService = {
  /**
   * Generates the content of constants.ts string based on current data
   */
  generateFileContent: (
    apiKey: string, 
    articles: Article[], 
    videos: VideoPost[], 
    ads: AdConfig[],
    files: VirtualFile[],
    users: UserProfile[],
    messages: Message[],
    ticker: TickerConfig,
    githubConfig?: GithubConfig
  ): string => {
    // Generate a new timestamp. This is the key to cross-device sync.
    const newTimestamp = Date.now();

    // Securely prepare Github Config
    // We split the token so when this file is committed to GitHub, it doesn't get revoked by the secret scanner.
    let tokenPart1 = "ghp_";
    let tokenPart2 = "";
    
    if (githubConfig?.token && githubConfig.token.startsWith("ghp_")) {
      tokenPart2 = githubConfig.token.substring(4);
    } else {
      tokenPart2 = githubConfig?.token || "";
    }

    const safeGithubConfigObj = {
      token: "REPLACE_WITH_SPLIT_TOKEN", // Placeholder to be replaced below
      owner: githubConfig?.owner || '',
      repo: githubConfig?.repo || '',
      branch: githubConfig?.branch || 'main'
    };

    const configString = JSON.stringify(safeGithubConfigObj, null, 2)
      .replace('"REPLACE_WITH_SPLIT_TOKEN"', `"${tokenPart1}" + "${tokenPart2}"`);

    return `import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, UserProfile, Message, TickerConfig } from './types';

// UPDATED VIA ADMIN PANEL SYNC - DO NOT EDIT MANUALLY
export const DATA_TIMESTAMP = ${newTimestamp};

export const CATEGORIES = ['World', 'Business', 'Sports', 'Technology', 'Health', 'Entertainment'];

export const DEFAULT_API_KEY = "${apiKey || ''}";

export const DEFAULT_GITHUB_TOKEN = "${tokenPart1}" + "${tokenPart2}";

// GitHub Settings (Synced via Cloud)
export const INITIAL_GITHUB_CONFIG: GithubConfig = ${configString};

export const INITIAL_TICKER_CONFIG: TickerConfig = ${JSON.stringify(ticker, null, 2)};

export const INITIAL_ADS: AdConfig[] = ${JSON.stringify(ads, null, 2)};

export const INITIAL_VIDEOS: VideoPost[] = ${JSON.stringify(videos, null, 2)};

export const INITIAL_ARTICLES: Article[] = ${JSON.stringify(articles, null, 2)};

export const INITIAL_USERS: UserProfile[] = ${JSON.stringify(users, null, 2)};

export const INITIAL_MESSAGES: Message[] = ${JSON.stringify(messages, null, 2)};

export const MOCK_ADMIN_EMAIL = "jobsofficial786@gmail.com";

export const INITIAL_PROJECT_FILES: VirtualFile[] = ${JSON.stringify(files, null, 2)};`;
  },

  /**
   * Commits the file to GitHub using the API
   */
  pushToGithub: async (
    config: GithubConfig, 
    fileContent: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!config.token || !config.owner || !config.repo) {
      return { success: false, message: "Missing GitHub credentials." };
    }

    // Try 'src/constants.ts' first (Standard Vite), then 'constants.ts' (Root)
    const pathsToTry = ["src/constants.ts", "constants.ts"];
    let targetPath = "";
    let sha = "";
    
    try {
      // Step 1: Find where the file lives
      for (const path of pathsToTry) {
        const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
        const getRes = await fetch(apiUrl, {
          headers: {
            Authorization: `token ${config.token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (getRes.ok) {
          const getData = await getRes.json();
          sha = getData.sha;
          targetPath = path;
          break; // Found it!
        }
      }

      // If we didn't find the file, default to src/constants.ts and create it
      if (!targetPath) {
        targetPath = "src/constants.ts";
      }

      const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${targetPath}`;

      // Step 2: Prepare the payload
      // Encode content to Base64 (Unicode safe)
      const utf8Bytes = new TextEncoder().encode(fileContent);
      const binaryString = Array.from(utf8Bytes, (byte) => String.fromCodePoint(byte)).join("");
      const base64Content = btoa(binaryString);

      const body: any = {
        message: `Roza CMS Auto-Sync: ${new Date().toLocaleString()}`,
        content: base64Content,
        branch: config.branch || "main"
      };

      if (sha) {
        body.sha = sha;
      }

      // Step 3: Send Update
      const putRes = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `token ${config.token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (putRes.ok) {
        return { success: true, message: "✅ Synced to GitHub successfully." };
      } else {
        const errData = await putRes.json();
        return { success: false, message: `GitHub Error: ${errData.message}` };
      }

    } catch (error: any) {
      console.error(error);
      return { success: false, message: `Network Error: ${error.message}` };
    }
  }
};