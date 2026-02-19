import html2canvas from 'html2canvas';

export const captureScreen = async (elementId, fileName = 'math-challenge-results.png') => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('Element not found:', elementId);
        return;
    }

    try {
        const canvas = await html2canvas(element, {
            backgroundColor: '#F0F7FF', // Default background for the app
            scale: 2, // Higher quality
            logging: false,
            useCORS: true
        });

        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = fileName;
        link.click();
    } catch (error) {
        console.error('Error capturing screen:', error);
    }
};
