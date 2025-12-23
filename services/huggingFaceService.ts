
import { HF_TOKEN, HF_USERNAME, HF_DATASET } from '../constants';

export const HuggingFaceService = {
  /**
   * Uploads any file to Hugging Face Dataset
   * Returns a permanent raw URL
   */
  uploadFile: async (file: File | Blob, folder: string = "uploads"): Promise<string> => {
    const fileName = `${Date.now()}_${(file as File).name || 'asset'}`;
    const path = `${folder}/${fileName}`;
    const repoId = `${HF_USERNAME}/${HF_DATASET}`;
    
    const url = `https://huggingface.co/api/datasets/${repoId}/upload/main/${path}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
        },
        body: file
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to upload to Hugging Face Cloud");
      }

      return `https://huggingface.co/datasets/${repoId}/resolve/main/${path}`;
    } catch (error) {
      console.error("HF Upload Error:", error);
      throw error;
    }
  },

  /**
   * Saves a JSON blob of the entire site data for persistence.
   * This is the "Main Database" file.
   */
  syncData: async (data: any): Promise<boolean> => {
    const repoId = `${HF_USERNAME}/${HF_DATASET}`;
    const path = `db/data.json`;
    const url = `https://huggingface.co/api/datasets/${repoId}/upload/main/${path}`;
    
    // Add a local timestamp to the data to prevent caching issues
    const dataWithMetadata = {
        ...data,
        _sync_info: {
            timestamp: Date.now(),
            version: "2.0-cloud"
        }
    };

    const blob = new Blob([JSON.stringify(dataWithMetadata, null, 2)], { type: 'application/json' });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
        },
        body: blob
      });
      return response.ok;
    } catch (error) {
      console.error("HF Cloud Sync Error:", error);
      return false;
    }
  },

  /**
   * Fetches the latest data JSON from HF Cloud
   */
  fetchLatestData: async (): Promise<any | null> => {
    const repoId = `${HF_USERNAME}/${HF_DATASET}`;
    const url = `https://huggingface.co/datasets/${repoId}/resolve/main/db/data.json`;
    
    try {
      // Use cache: 'no-store' or a random query param to always get the freshest data
      const res = await fetch(`${url}?nocache=${Date.now()}`, {
          cache: 'no-store'
      });
      if (res.ok) return await res.json();
      return null;
    } catch (e) {
      console.warn("Could not fetch remote data.json from Hugging Face.");
      return null;
    }
  }
};
