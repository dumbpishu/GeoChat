import { api } from "@/lib/axios";

export type MentionUser = {
    id: string;
    name: string;
    username: string;
    avatar?: string;
};

export const searchMentionsApi = async (query: string): Promise<MentionUser[]> => {
    try {
        const response = await api.get(`/api/users/mentions?q=${encodeURIComponent(query)}`);
        return response.data?.data || [];
    } catch (error: any) {
        console.error("Error searching mentions:", error);
        return [];
    }
};

export const updateUserApi = async (userData: { name?: string; username?: string }) => {
    try {
        const response = await api.patch("/api/users/info", userData);
        return response.data?.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to update user");
    }
};

export const updateAvatarApi = async (avatar: File) => {
    try {
        const formData = new FormData();
        formData.append("avatar", avatar);
        
        const response = await api.patch("/api/users/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data?.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to update avatar");
    }
};

export const deleteUserApi = async () => {
    try {
        await api.delete("/api/users");
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to delete user");
    }
};