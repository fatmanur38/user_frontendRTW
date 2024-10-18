import { create } from 'zustand';
import axios from 'axios';

const useInterviewStore = create((set) => ({
    questions: [], // Initialize questions as an empty array
    isLoading: false,
    error: null,

    // Fetch interview by video link
    fetchInterviewByLink: async (videoLink) => {
        set({ isLoading: true });
        const apiURL = import.meta.env.VITE_API_URL; // Use environment variable for API URL
        try {
            const response = await axios.get(`${apiURL}/interviews/link/${videoLink}`, {});
            const fetchedQuestions = response.data.interview.questions;
            console.log("Fetched questions:", fetchedQuestions);

            set({ questions: fetchedQuestions, isLoading: false });

        } catch (error) {
            set({
                error: 'Failed to fetch interview data',
                isLoading: false,
            });
            console.error('Error fetching interview by video link:', error);
        }
    },
}));

export default useInterviewStore;