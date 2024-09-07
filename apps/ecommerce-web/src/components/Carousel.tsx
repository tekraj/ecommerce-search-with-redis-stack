import React, { useState } from 'react';


export function Carousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = [
        { id: 1, image: 'https://via.placeholder.com/800x400', caption: 'Slide 1' },
        { id: 2, image: 'https://via.placeholder.com/800x400', caption: 'Slide 2' },
        { id: 3, image: 'https://via.placeholder.com/800x400', caption: 'Slide 3' },
    ];

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
    };

    return (
        <div className="relative w-full h-64 overflow-hidden">
            <div className="relative w-full h-full">
                {slides.map((slide, index) => (
                    <div
                        className={`absolute inset-0 transition-transform duration-500 ${index === currentIndex ? 'translate-x-0' : 'translate-x-full'}`}
                        key={slide.id}
                        style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                        <div className="absolute bottom-0 left-0 bg-gray-800 bg-opacity-50 text-white p-4">
                            {slide.caption}
                        </div>
                    </div>
                ))}
            </div>
            <button className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                onClick={handlePrev}
                type='button'
            >
                ‹
            </button>
            <button className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                onClick={handleNext}
                type='button'
            >
                ›
            </button>
            <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 p-2">
                {slides.map((slide, index) => (
                    <div
                        className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
                        key={slide.id}
                    />
                ))}
            </div>
        </div>
    );
}

