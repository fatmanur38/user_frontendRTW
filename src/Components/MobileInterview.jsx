import React, { useRef } from 'react';

const MobileInterview = ({
    questions,
    timeLeft,
    totalTimeLeft,
    currentQuestionIndex,
    skipQuestion,
    startRecording,
    stopRecording,
    isRecording,
    videolink,
}) => {
    const videoRef = useRef(null);

    const handleStartRecording = async () => {
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

            startRecording();
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-black">
            {/* Timer and Progress */}
            <div className="flex justify-between p-4">
                {/* Total Time Section */}
                <div className="flex flex-col items-start text-white">
                    <p className="text-sm font-light">Total Time</p>
                    <div className="text-lg font-semibold">
                        {Math.floor(totalTimeLeft / 60)}:{(totalTimeLeft % 60).toString().padStart(2, '0')}
                    </div>
                </div>

                {/* Time Left for Question Section */}
                <div className="flex flex-col items-end text-white">
                    <p className="text-sm font-light">Time Left for This Question</p>
                    <div className="text-lg font-semibold">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                </div>
            </div>

            {/* Video */}
            <div className="flex-1 flex justify-center items-center">
                <video ref={videoRef} className="w-full h-full bg-black" autoPlay muted></video>
            </div>

            {/* Question */}
            <div className="text-white text-center py-4 px-8">
                <p className="text-lg font-bold">{questions[currentQuestionIndex]?.question}</p>
            </div>

            {/* Controls */}
            <div className="flex justify-between px-4 py-4">
                <button
                    onClick={skipQuestion}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                    Skip Question
                </button>
                <button
                    onClick={isRecording ? stopRecording : handleStartRecording}
                    className={`px-4 py-2 text-white rounded-lg ${isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
                        }`}
                >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
            </div>
        </div>
    );
};

export default MobileInterview;