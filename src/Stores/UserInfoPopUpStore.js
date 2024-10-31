import { create } from 'zustand';
import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL;

const useUserStore = create((set) => ({
    status: 'idle',
    error: null,
    userId: null,  // Store the user ID here

    sendUserInfo: async (personalData) => {
        set({ status: 'loading', error: null });
        try {
            const response = await axios.post(`${apiURL}/users`, personalData);
            set({ status: 'success', userId: response.data._id });  // Store the _id
            console.log('User ID:', response.data._id);
        } catch (error) {
            set({ status: 'error', error: error.message });
            console.error('Error:', error);
        }
    },
}));

export default useUserStore;