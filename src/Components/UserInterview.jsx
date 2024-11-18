import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PersonalInfoPopup from '../Components/PersonelInfoPopUp';
import useInterviewStore from '../Stores/UserInterviewStore';
import ProgressBar from '../Components/ProgressBar';
import Timer from './Timer';

const UserInterview = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(null);
    const [totalTimeLeft, setTotalTimeLeft] = useState(null);
    const [fade, setFade] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [startTimer, setStartTimer] = useState(false);
    const [isLoadingUpload, setIsLoadingUpload] = useState(false);
    const [isUploadSuccess, setIsUploadSuccess] = useState(false);
    const videoRef = useRef(null);
    const recordedChunks = useRef([]);
    const { videolink } = useParams();
    const { questions, fetchInterviewByLink, uploadVideo, isLoading, error } = useInterviewStore();

    // Fetch interview by video link
    useEffect(() => {
        if (videolink) {
            fetchInterviewByLink(videolink);
        }
    }, [videolink]);

    // Set initial times once questions are loaded
    useEffect(() => {
        if (questions && questions.length > 0) {
            setCurrentQuestionIndex(0);
            setTimeLeft(questions[0].time);
            const totalTimeInSeconds = questions.reduce((total, question) => total + question.time, 0);
            setTotalTimeLeft(totalTimeInSeconds);
        }
    }, [questions]);

    // Skip to the next question with a fade effect
    const skipQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setFade(true);
            setTimeout(() => {
                setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
                setTimeLeft(questions[currentQuestionIndex + 1]?.time || 0);
                setFade(false);
            }, 300);
        }
    };

    // Start recording video
    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.current.push(event.data);
            }
        };

        setMediaRecorder(recorder);
        recorder.start();
        setIsRecording(true);

        // Start timer when recording starts
        setStartTimer(true);
    };

    // Stop recording video and upload it
    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);

            mediaRecorder.onstop = async () => {
                const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
                recordedChunks.current = [];
                setIsLoadingUpload(true); // Show loading screen

                try {
                    await uploadVideo(blob, videolink);
                    setIsLoadingUpload(false); // Hide loading screen
                    setIsUploadSuccess(true); // Show success screen
                } catch (error) {
                    console.error('Video upload failed:', error);
                    setIsLoadingUpload(false); // Hide loading screen
                }
            };
        }
    };

    // Preview the camera feed without recording
    const handlePreview = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
    };

    // Handle when the time for a question is up
    const handleTimeUp = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
            setTimeLeft(questions[currentQuestionIndex + 1]?.time || 0);
        }
    };

    if (isLoading) return <p>Loading interview data...</p>;
    if (error) return <p className="text-red-500">Error loading interview: {error}</p>;

    // Show loading screen during upload
    if (isLoadingUpload) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                <p className="text-white text-2xl font-semibold">Mülakat kaydediliyor...</p>
            </div>
        );
    }

    // Show success message after upload
    if (isUploadSuccess) {
        return (
            <>
                <div className="flex flex-col items-center justify-center h-screen bg-white">
                    <p className="text-3xl font-bold text-green-600 mb-4">Mülakat kaydedildi!</p>
                    <h1 className="text-2xl font-semibold text-gray-700 mt-4">
                        Teşekkür ederiz. Sekmeyi Kapatabilirsiniz.
                    </h1>
                </div>

            </>
        );
    }

    return (
        <div className="flex flex-col h-screen">
            {/* Progress Bar at the Top */}
            <div className="w-full p-4">
                <ProgressBar totalQuestions={questions.length} currentQuestion={currentQuestionIndex} />
            </div>

            {/* Top Section: Timer on the left, logo on the right */}
            <div className="flex justify-between w-full p-4 h-[23%]">
                <div className="w-[48%] ml-4 flex items-center bg-gray-100 rounded-2xl justify-center">
                    <img src="https://remotetech.work/assets/img/logo/logo.svg" alt="Logo" className="w-2/3" />
                </div>

                <div className="w-[48%] mr-4 flex items-center bg-gray-100 rounded-2xl justify-center">
                    <div className="flex flex-col items-center">
                        <Timer timeLeft={timeLeft} totalTime={totalTimeLeft} onTimeUp={handleTimeUp} start={startTimer} />
                        <div className="text-lg font-semibold">
                            Total Time: {Math.floor(totalTimeLeft / 60)}:{(totalTimeLeft % 60).toString().padStart(2, '0')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Video on the left, Questions on the right */}
            <div className="flex justify-between w-full h-[69%] p-4">
                <div className="w-[48%] ml-4 flex items-center border shadow-md justify-center bg-white rounded-2xl">
                    <video ref={videoRef} className="w-full h-full bg-black rounded-lg" autoPlay muted></video>
                </div>

                <div className="w-[48%] mr-4 flex flex-col border shadow-md rounded-2xl justify-between bg-white p-4">
                    <h2 className="text-4xl pt-8 flex items-center mt-10 justify-center font-semibold text-gray-700">
                        Question {currentQuestionIndex + 1}
                    </h2>

                    <div className={`flex flex-col justify-center items-center flex-grow transition-opacity duration-300 ${fade ? 'opacity-0' : 'opacity-100'}`}>
                        <p className="text-5xl font-bold mt-4 mb-12 text-center text-[#001F54]">
                            {questions[currentQuestionIndex]?.question}
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-around mt-4">
                        <button onClick={skipQuestion} className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400">
                            Soruyu Atla
                        </button>
                        <button
                            onClick={handlePreview}
                            className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600"
                        >
                            Kamerayı Önizle
                        </button>
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`px-4 py-2 text-white font-semibold rounded-md ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                            {isRecording ? 'Mülakatı Bitir' : 'Mülakata Başla'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Personal Information Form Popup */}
            <PersonalInfoPopup
                isOpen={isFormOpen}
                closePopup={() => setIsFormOpen(false)}
            />
        </div>
    );
};

export default UserInterview;