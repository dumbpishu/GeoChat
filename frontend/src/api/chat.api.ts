import { api } from "@/lib/axios";

type UploadedMedia = {
  url: string;
  type: "image" | "video" | "audio" | "file";
};

export const uploadChatMediaApi = async (files: File[]): Promise<UploadedMedia[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("media", file);
  });

  try {
    const response = await api.post("/api/chats/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to upload media");
  }
};