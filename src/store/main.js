import { create } from 'zustand'

const useStore = create((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    users: [],
    setUsers: (users) => set({ users }),
    error: null,
    posts: [],
    userObjects: [],
    setUserObjects: (userObjects) => set({ userObjects: userObjects }),
    setPosts: (newPosts) => set({ posts: newPosts }),
    setError: (error) => set({ error }),
    messages: [],
    setMessages: (newMessages) => set({ messages: newMessages }),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] }))




}));

export default useStore;