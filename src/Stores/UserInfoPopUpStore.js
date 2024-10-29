import { create } from 'zustand';
import axios from 'axios';
const apiURL = import.meta.env.VITE_API_URL;
console.log("apiURL: ", apiURL);
const useUserStore = create((set) => ({
    userInfo: {},
    error: null,
    status: 'idle',
    // Action to send the POST request using Axios
    sendUserInfo: async (userData) => {
        set({ status: 'loading', error: null });

        try {
            const response = await axios.post(`${apiURL}/users`, userData);
            set({ userInfo: response.data, status: 'success' });
            console.log("response", response.data._id)

        } catch (error) {
            set({
                error: error.response ? error.response.data : error.message,
                status: 'error',
            });
        }
    },
}));

export default useUserStore;