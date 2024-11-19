import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PersonalInfoPopup from '../Components/PersonelInfoPopUp';
import useInterviewStore from '../Stores/UserInterviewStore';
import ProgressBar from '../Components/ProgressBar';
import Timer from './Timer';
import MobileInterview from './MobileInterview';
import { useMediaQuery } from 'react-responsive';

const UserInterview = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(null);
    const [totalTimeLeft, setTotalTimeLeft] = useState(null);
    const [fade, setFade] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isUploadSuccess, setIsUploadSuccess] = useState(false);
    const [isLoadingUpload, setIsLoadingUpload] = useState(false);
    const videoRef = useRef(null);
    const recordedChunks = useRef([]);
    const { videolink } = useParams();
    const { questions, fetchInterviewByLink, uploadVideo, isLoading, error } = useInterviewStore();
    const isMobileOrTablet = useMediaQuery({ maxWidth: 1024 });

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

    const handlePreview = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
    };

    // Handle time-up logic
    const handleTimeUp = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
            setTimeLeft(questions[currentQuestionIndex + 1]?.time || 0);
        }
    };

    // Start the countdown timer
    const startTimer = () => {
        const questionInterval = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime > 0) {
                    return prevTime - 1;
                } else {
                    clearInterval(questionInterval);
                    handleTimeUp();
                    return 0;
                }
            });
        }, 1000);
        return () => clearInterval(questionInterval);
    };

    // Start recording video
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            } else {
                console.error('Video element is not available.');
            }

            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.current.push(event.data);
                }
            };

            setMediaRecorder(recorder);
            recorder.start();
            setIsRecording(true);

            startTimer(); // Start the timer when recording begins
        } catch (err) {
            console.error('Error accessing media devices:', err);
        }
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

    if (isLoading) return <p>Loading interview data...</p>;
    if (error) return <p className="text-red-500">Error loading interview: {error}</p>;

    if (isLoadingUpload) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                <p className="text-white text-2xl font-semibold">Uploading interview...</p>
            </div>
        );
    }

    if (isUploadSuccess) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white">
                <p className="text-3xl font-bold text-green-600 mb-4 text-center">
                    Interview uploaded successfully!
                </p>
                <h1 className="text-2xl font-semibold text-gray-700 mt-4 text-center">
                    Thank you! You may close this tab.
                </h1>
            </div>
        );
    }
    return (
        <div className="flex flex-col h-screen">
            {/* Personal Information Form Popup */}
            <PersonalInfoPopup isOpen={isFormOpen} closePopup={() => setIsFormOpen(false)} />

            {!isFormOpen && (
                <>
                    {isMobileOrTablet ? (
                        <MobileInterview
                            questions={questions}
                            timeLeft={timeLeft}
                            totalTimeLeft={totalTimeLeft}
                            currentQuestionIndex={currentQuestionIndex}
                            skipQuestion={skipQuestion}
                            startRecording={startRecording}
                            stopRecording={stopRecording}
                            isRecording={isRecording}
                            videolink={videolink}
                        />
                    ) : (
                        <>
                            {/* Progress Bar */}
                            <div className="w-full p-4">
                                <ProgressBar totalQuestions={questions.length} currentQuestion={currentQuestionIndex} />
                            </div>

                            {/* Timer Section */}
                            <div className="flex justify-between w-full p-4 h-[23%]">
                                <div className="w-[48%] ml-4 flex items-center bg-gray-100 rounded-2xl justify-center">
                                    <img src="https://remotetech.work/assets/img/logo/logo.svg" alt="Logo" className="w-2/3" />
                                </div>
                                <div className="w-[48%] mr-4 flex items-center bg-gray-100 rounded-2xl justify-center">
                                    <div className="flex flex-col items-center">
                                        <Timer timeLeft={timeLeft} totalTime={totalTimeLeft} onTimeUp={handleTimeUp} />
                                        <div className="text-lg font-semibold">
                                            Total Time: {Math.floor(totalTimeLeft / 60)}:{(totalTimeLeft % 60).toString().padStart(2, '0')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Video and Question Section */}
                            <div className="flex justify-between w-full h-[69%] p-4">
                                <div className="w-[48%] ml-4 flex items-center border shadow-md justify-center bg-white rounded-2xl">
                                    <video ref={videoRef} className="w-full h-full bg-black rounded-lg" autoPlay muted></video>
                                </div>
                                <div className="w-[48%] mr-4 flex flex-col border shadow-md rounded-2xl justify-between bg-white p-4">
                                    <h2 className="text-4xl pt-8 flex items-center mt-10 justify-center font-semibold text-gray-700">
                                        Question {currentQuestionIndex + 1}
                                    </h2>
                                    <div
                                        className={`flex flex-col justify-center items-center flex-grow transition-opacity duration-300 ${fade ? 'opacity-0' : 'opacity-100'
                                            }`}
                                    >
                                        <p className="text-5xl font-bold mt-4 mb-12 text-center text-[#001F54]">
                                            {questions[currentQuestionIndex]?.question}
                                        </p>
                                    </div>
                                    <div className="flex justify-around mt-4">
                                        <button onClick={skipQuestion} className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400">
                                            Skip Question
                                        </button>
                                        <button
                                            onClick={handlePreview}
                                            className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600"
                                        >
                                            Preview
                                        </button>
                                        <button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={`px-4 py-2 text-white font-semibold rounded-md ${isRecording
                                                ? 'bg-red-500 hover:bg-red-600'
                                                : 'bg-green-500 hover:bg-green-600'
                                                }`}
                                        >
                                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default UserInterview;