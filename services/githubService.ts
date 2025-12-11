import { GithubConfig, Article, VideoPost, AdConfig, VirtualFile } from "../types";

export const GithubService = {
  /**
   * Generates the content of constants.ts string based on current data
   */
  generateFileContent: (
    apiKey: string, 
    articles: Article[], 
    videos: VideoPost[], 
    ads: AdConfig[],
    files: VirtualFile[]
  ): string => {
    // We use JSON.stringify with null, 2 to format it nicely
    return `import { Article, AdConfig, VirtualFile, VideoPost } from './types';

export const CATEGORIES = ['World', 'Business', 'Sports', 'Technology', 'Health', 'Entertainment'];

export const DEFAULT_API_KEY = "${apiKey || ''}";

export const INITIAL_ADS: AdConfig[] = ${JSON.stringify(ads, null, 2)};

export const INITIAL_VIDEOS: VideoPost[] = ${JSON.stringify(videos, null, 2)};

export const INITIAL_ARTICLES: Article[] = ${JSON.stringify(articles, null, 2)};

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

    const path = "constants.ts";
    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;

    try {
      // 1. Get the current file SHA (required to update)
      const getRes = await fetch(apiUrl, {
        headers: {
          Authorization: `token ${config.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      let sha = "";
      if (getRes.ok) {
        const getData = await getRes.json();
        sha = getData.sha;
      } else if (getRes.status !== 404) {
        return { success: false, message: "Failed to connect to GitHub. Check Token." };
      }

      // 2. Encode content to Base64 (Unicode safe)
      const utf8Bytes = new TextEncoder().encode(fileContent);
      const binaryString = Array.from(utf8Bytes, (byte) => String.fromCodePoint(byte)).join("");
      const base64Content = btoa(binaryString);

      // 3. Push Update
      const body: any = {
        message: "Auto-update content via Roza Admin Panel",
        content: base64Content,
        branch: config.branch || "main"
      };

      if (sha) {
        body.sha = sha;
      }

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
        return { success: true, message: "Successfully pushed to GitHub! Live site will update in 2-3 mins." };
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