import React, { useEffect, useState } from 'react';
//
const Timer = ({ timeLeft, totalTime, onTimeUp, start }) => {
    const [currentTimeLeft, setCurrentTimeLeft] = useState(timeLeft);

    // Reset the timer whenever the timeLeft prop changes (i.e., when the question changes)
    useEffect(() => {
        setCurrentTimeLeft(timeLeft);
    }, [timeLeft]);

    useEffect(() => {
        let timerInterval;
        if (start && currentTimeLeft > 0) {
            timerInterval = setInterval(() => {
                setCurrentTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        }

        if (currentTimeLeft === 0) {
            onTimeUp(); // If time runs out, move to the next question
        }

        return () => clearInterval(timerInterval);
    }, [currentTimeLeft, start, onTimeUp]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return { minutes, seconds };
    };

    const formattedTimeLeft = formatTime(currentTimeLeft);

    // Determine the timer color based on the time left
    const getTimerColor = () => {
        if (currentTimeLeft <= 60) {
            return 'text-red-500'; // Last 1 minute - red
        } else if (currentTimeLeft <= totalTime / 2) {
            return 'text-orange-500'; // Halfway - orange
        } else {
            return 'text-green-500'; // More than half - green
        }
    };

    return (
        <div className="flex justify-center items-center bg-gray-100 rounded-md p-2 w-full mb-2">
            <span className={`text-5xl font-bold ${getTimerColor()}`}>
                {formattedTimeLeft.minutes.toString().padStart(2, '0')} : {formattedTimeLeft.seconds.toString().padStart(2, '0')}
            </span>
        </div>
    );
};

export default Timer;