import { create } from "zustand";
import { updateUserApi, updateAvatarApi, deleteUserApi } from "@/api/user.api";

type User = {
    id: string;
    name?: string;
    email: string;
    username: string;
    avatar?: string;
}

type UserState = {
    user: User | null;

    setUser: (user: User | null) => void;
    clearUser: () => void;

    updateUser: (userData: { name?: string; username?: string }) => Promise<void>;
    updateAvatar: (avatar: File) => Promise<void>;
    deleteUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    user: JSON.parse(localStorage.getItem("currentUser") || "null"),

    setUser: (user) => {
        set({ user });
        if (user) {
            localStorage.setItem("currentUser", JSON.stringify(user));
        } else {
            localStorage.removeItem("currentUser");
        }
    },

    clearUser: () => {
        set({ user: null });
        localStorage.removeItem("currentUser");
    },

    updateUser: async (userData) => {
        const updatedUser = await updateUserApi(userData);
        set({ user: updatedUser });
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    },

    updateAvatar: async (avatar) => {
        const updatedUser = await updateAvatarApi(avatar);
        set({ user: updatedUser });
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    },

    deleteUser: async () => {
        await deleteUserApi();
        set({ user: null });
        localStorage.removeItem("currentUser");
    }
}))