import { create } from 'zustand';
import axios from 'axios';
import useUserStore from './UserInfoPopUpStore';

const apiURL = import.meta.env.VITE_API_URL;

const useInterviewStore = create((set) => ({
    questions: [],
    isLoading: false,
    error: null,
    interviewID: null,

    // Fetch interview data using videoLink
    fetchInterviewByLink: async (videoLink) => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${apiURL}/interviews/link/${videoLink}`);
            const fetchedQuestions = response.data.interview.questions;
            set({ questions: fetchedQuestions, isLoading: false });
            console.log('Interview data:', response.data);
        } catch (error) {
            set({ error: 'Failed to fetch interview data', isLoading: false });
            console.error('Error fetching interview:', error);
        }
    },

    // Upload video, update user's video URL, and link user to interview
    uploadVideo: async (videoBlob, videoLink) => {
        const formData = new FormData();
        formData.append('ProjectName', import.meta.env.VITE_S3_PROJECT_NAME);
        formData.append('BucketName', import.meta.env.VITE_S3_BUCKET_NAME);
        formData.append('AccessKey', import.meta.env.VITE_S3_ACCESS_KEY);
        formData.append('file', videoBlob, 'user-interview.webm');

        try {
            // Upload video to S3
            const uploadResponse = await axios.post(`${apiURL}/s3/upload`, formData);
            console.log('Video upload response:', uploadResponse.data);

            // Extract fileId from the response
            const fileId = uploadResponse.data.data.files[0].fileId;

            // Retrieve userId from useUserStore
            const userId = useUserStore.getState().userId;
            console.log('User ID from useUserStore:', userId);

            // Get video info using the fileId
            const videoInfoUrl = `${apiURL}/s3/videos/${fileId}`;
            const videoInfoResponse = await axios.get(videoInfoUrl);
            const videoUrl = videoInfoResponse.data.data.url;
            console.log('Video URL:', videoUrl);

            // Send the video URL to the user endpoint with a PUT request
            const updateUserVideoUrl = `${apiURL}/users/${userId}/video-url`;
            const updateResponse = await axios.put(updateUserVideoUrl, { userId, videoUrl });
            console.log('Update user video URL response:', updateResponse.data);

            // Retrieve the interview ID with videoLink
            const resp = await axios.get(`${apiURL}/interviews/link/${videoLink}`);
            const interviewID = resp.data.interview._id;
            set({ interviewID }); // Store interviewID in the state if needed
            console.log("Interview ID:", interviewID);

            // New PUT request to link the user to the interview
            const linkUserToInterviewUrl = `${apiURL}/interviews/${interviewID}/users`;
            const linkResponse = await axios.put(linkUserToInterviewUrl, {
                userIds: [userId],
            });
            console.log('Link user to interview response:', linkResponse.data);

            return { updateResponse: updateResponse.data, linkResponse: linkResponse.data, interviewID };
        } catch (error) {
            console.error('Error in video upload or linking user to interview:', error.response?.data || error.message);
            set({ error: 'Failed to upload video, fetch video info, or link user to interview' });
        }
    },
}));

export default useInterviewStore;