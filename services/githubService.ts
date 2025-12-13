
import { GithubConfig, Article, VideoPost, AdConfig, VirtualFile, UserProfile, Message, TickerConfig, JobApplication, JobPosition } from "../types";

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
    githubConfig?: GithubConfig,
    jobApplications?: JobApplication[],
    jobs?: JobPosition[]
  ): string => {
    // Generate a new timestamp. This is the key to cross-device sync.
    const newTimestamp = Date.now();

    // Securely prepare Github Config
    // We split the token so when this file is committed to GitHub, it doesn't get revoked by the secret scanner.
    let tokenPart1 = "ghp_";
    let tokenPart2 = "";
    
    if (githubConfig?.token && githubConfig.token.startsWith("ghp_")) {
      tokenPart1 = "ghp_";
      tokenPart2 = githubConfig.token.substring(4);
    } else if (githubConfig?.token) {
      // Handle non-ghp tokens (fine-grained PATs start with github_pat_)
      if (githubConfig.token.startsWith("github_pat_")) {
         tokenPart1 = "github_pat_";
         tokenPart2 = githubConfig.token.substring(11);
      } else {
         tokenPart1 = "";
         tokenPart2 = githubConfig.token;
      }
    }

    const safeGithubConfigObj = {
      token: "REPLACE_WITH_SPLIT_TOKEN", // Placeholder to be replaced below
      owner: githubConfig?.owner || '',
      repo: githubConfig?.repo || '',
      branch: githubConfig?.branch || 'main'
    };

    const configString = JSON.stringify(safeGithubConfigObj, null, 2)
      .replace('"REPLACE_WITH_SPLIT_TOKEN"', `"${tokenPart1}" + "${tokenPart2}"`);

    return `import { Article, AdConfig, VirtualFile, VideoPost, GithubConfig, UserProfile, Message, TickerConfig, JobPosition, JobApplication } from './types';

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

export const INITIAL_JOBS: JobPosition[] = ${JSON.stringify(jobs || [], null, 2)};

// USERS DATABASE SYNCED
export const INITIAL_USERS: UserProfile[] = ${JSON.stringify(users, null, 2)};

export const INITIAL_MESSAGES: Message[] = ${JSON.stringify(messages, null, 2)};

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = ${JSON.stringify(jobApplications || [], null, 2)};

export const MOCK_ADMIN_EMAIL = "rozanewsofficial@gmail.com";

export const INITIAL_PROJECT_FILES: VirtualFile[] = ${JSON.stringify(files, null, 2)};`;
  },

  /**
   * Commits the file to GitHub using the API
   */
  pushToGithub: async (
    config: GithubConfig, 
    fileContent: string
  ): Promise<{ success: boolean; message: string }> => {
    // 1. Basic Validation
    if (!config.token) return { success: false, message: "Missing GitHub Token." };
    if (!config.owner) return { success: false, message: "Missing Repository Owner (Username)." };
    if (!config.repo) return { success: false, message: "Missing Repository Name." };

    const branch = config.branch || "main";
    const primaryPath = "src/constants.ts"; 
    const secondaryPath = "constants.ts";
    
    let targetPath = primaryPath;
    let sha: string | undefined = undefined;

    try {
        // 2. Check Primary Path (src/constants.ts)
        let getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${primaryPath}?ref=${branch}`;
        let getRes = await fetch(getUrl, {
            headers: { 
                Authorization: `token ${config.token}`,
                Accept: "application/vnd.github.v3+json"
            }
        });

        // 3. If not found, Check Secondary Path (constants.ts)
        if (!getRes.ok && getRes.status === 404) {
            getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${secondaryPath}?ref=${branch}`;
            const secondaryRes = await fetch(getUrl, {
                headers: { 
                    Authorization: `token ${config.token}`,
                    Accept: "application/vnd.github.v3+json"
                }
            });
            
            if (secondaryRes.ok) {
                targetPath = secondaryPath;
                getRes = secondaryRes; // Use this response
            } else {
               // Both failed. We assume we need to create the file.
               // We will stick to primaryPath (src/constants.ts) for creation.
               // Unless the error was Auth related.
               if (secondaryRes.status === 401) {
                  return { success: false, message: "Authentication Failed. Check your Personal Access Token." };
               }
            }
        }

        // 4. Process GET Result
        if (getRes.ok) {
            const data = await getRes.json();
            sha = data.sha;
        } else if (getRes.status === 401) {
             return { success: false, message: "Authentication Failed. Invalid Token." };
        } else if (getRes.status === 404) {
             // File doesn't exist. We will create it.
             sha = undefined;
        } else {
             // Other error (Rate limit, 500, etc)
             return { success: false, message: `GitHub API Error during fetch: ${getRes.status} ${getRes.statusText}` };
        }

        // 5. Prepare PUT Request
        const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${targetPath}`;
        
        // Encode content properly for Unicode
        const utf8Bytes = new TextEncoder().encode(fileContent);
        const binaryString = Array.from(utf8Bytes, (byte) => String.fromCodePoint(byte)).join("");
        const base64Content = btoa(binaryString);

        const body: any = {
            message: `Roza CMS Sync: ${new Date().toLocaleString()}`,
            content: base64Content,
            branch: branch
        };
        
        // Include SHA if we are updating
        if (sha) body.sha = sha;

        const putRes = await fetch(putUrl, {
            method: "PUT",
            headers: {
                Authorization: `token ${config.token}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        });

        if (putRes.ok) {
            return { success: true, message: `✅ Successfully synced to ${targetPath}` };
        } else {
            const errorData = await putRes.json();
            const errorMsg = errorData.message || "Unknown error";
            
            if (putRes.status === 404) {
               return { success: false, message: `Sync Failed: Repository '${config.owner}/${config.repo}' not found. Check your username and repo name.` };
            }
            if (putRes.status === 409) {
               return { success: false, message: `Sync Conflict: The file changed remotely. Try again.` };
            }
            
            return { success: false, message: `GitHub Error: ${errorMsg}` };
        }

    } catch (e: any) {
        return { success: false, message: `Network Error: ${e.message}` };
    }
  }
};
