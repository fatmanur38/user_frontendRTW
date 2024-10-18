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
    const [timeLeft, setTimeLeft] = useState(null); // For current question time
    const [totalTimeLeft, setTotalTimeLeft] = useState(null); // For total interview time
    const [fade, setFade] = useState(false); // To handle the fade effect
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const videoRef = useRef(null);
    const recordedChunks = useRef([]);
    const { videolink } = useParams();
    const { questions, fetchInterviewByLink, isLoading, error } = useInterviewStore();

    // Fetch interview by link
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

    // Handle skipping questions with fade effect
    const skipQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setFade(true); // Trigger fade-out
            setTimeout(() => {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setTimeLeft(questions[currentQuestionIndex + 1].time);
                setFade(false); // Trigger fade-in after question change
            }, 300); // Duration for fade-out transition
        }
    };

    // Start recording and the timer
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

        recorder.onstop = () => {
            const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);

            // Save to local storage
            localStorage.setItem('recordedVideo', url);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'user-interview.webm';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            recordedChunks.current = [];
        };

        setMediaRecorder(recorder);
        recorder.start();
        setIsRecording(true);

        // Start timers
        startTimer();
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    // Start the question and total time countdown when the recording starts
    const startTimer = () => {
        // Question-specific timer
        const questionInterval = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime > 0) {
                    return prevTime - 1;
                } else {
                    clearInterval(questionInterval); // Stop the question interval when time runs out
                    handleTimeUp(); // Move to the next question
                    return 0;
                }
            });
        }, 1000);

        // Total interview time timer
        const totalInterval = setInterval(() => {
            setTotalTimeLeft((prevTime) => {
                if (prevTime > 0) {
                    return prevTime - 1;
                } else {
                    clearInterval(totalInterval); // Stop when total time runs out
                    stopRecording(); // Stop recording when total time is up
                    return 0;
                }
            });
        }, 1000);

        // Cleanup intervals when recording stops
        return () => {
            clearInterval(questionInterval);
            clearInterval(totalInterval);
        };
    };

    const handlePreview = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
    };

    const handleTimeUp = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setTimeLeft(questions[currentQuestionIndex + 1].time);
        }
    };

    if (isLoading) return <p>Loading interview data...</p>;
    if (error) return <p className="text-red-500">Error loading interview: {error}</p>;

    return (
        <div className="flex flex-col w-full h-screen bg-gray-100">
            {/* Progress Bar */}
            <div className="w-full p-4">
                <ProgressBar totalQuestions={questions.length} currentQuestion={currentQuestionIndex} />
            </div>

            {/* Content (Video and Questions) */}
            <div className="flex w-3/4 mx-auto flex-grow border rounded-lg p-4 bg-white">
                {/* Video Section */}
                <div className="w-1/2 flex justify-center items-center border-r-2 pr-4">
                    <video ref={videoRef} className="w-full h-full bg-black rounded-lg" autoPlay muted></video>
                </div>

                {/* Question and Timer Section */}
                <div className="w-1/2 flex flex-col justify-center pl-4">
                    {/* Timer */}
                    <Timer timeLeft={timeLeft} totalTime={totalTimeLeft} onTimeUp={handleTimeUp} />

                    {/* Question */}
                    <div className={`flex flex-col justify-center flex-grow transition-opacity duration-300 ${fade ? 'opacity-0' : 'opacity-100'}`}>
                        <h2 className="text-2xl font-bold text-left">Question:</h2>
                        <p className="text-gray-700 text-6xl mt-2 text-center">{questions[currentQuestionIndex]?.question}</p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between w-full mt-4">
                        <button onClick={skipQuestion} className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400">
                            Skip
                        </button>
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`px-4 py-2 text-white font-semibold rounded-md ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                            {isRecording ? 'Done' : 'Start'}
                        </button>
                        <button
                            onClick={handlePreview}
                            className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600"
                        >
                            Önizle
                        </button>
                    </div>
                </div>
            </div>
            {/* Personal Information Form Popup */}
            <PersonalInfoPopup isOpen={isFormOpen} closePopup={() => setIsFormOpen(false)} savePersonalInfo={() => { }} />
        </div>
    );
};

export default UserInterview;