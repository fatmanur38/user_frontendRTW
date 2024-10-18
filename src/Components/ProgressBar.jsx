import React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

const ProgressBar = ({ totalQuestions, currentQuestion }) => {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        const calculatedProgress = (currentQuestion / totalQuestions) * 100;
        setProgress(calculatedProgress);
    }, [currentQuestion, totalQuestions]);

    return (
        <Box className="w-3/4 mx-auto mt-4"> {/* Centered, reduced width, and added top margin */}
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    height: 10, // Increase height as needed
                    borderRadius: '9999px' // Full rounding for smooth edges
                }}
                className="rounded-full" // Tailwind for full rounding
            />
        </Box>
    );
};

export default ProgressBar;