import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/Gallery.css'; // Updated import path
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Construct image paths using Vite's base URL environment variable
const imageFiles = [
  { id: 1, fileName: 'DSCF2100.JPG', title: 'Photography 1' },
  { id: 2, fileName: 'DSCF1847.JPG', title: 'Photography 2' },
  { id: 3, fileName: 'DSCF2283.jpg', title: 'Photography 3' },
  { id: 4, fileName: 'DSCF2205.jpg', title: 'Photography 4' },
  { id: 5, fileName: 'DSCF2270.jpg', title: 'Photography 5' },
  // Add more images here if you have them
];

const actualImages = imageFiles.map(img => ({
  ...img,
  src: `${import.meta.env.BASE_URL}images/${img.fileName}`
}));

// Prepare slides for the lightbox (it expects an array of objects with a `src` property)
const slides = actualImages.map(image => ({ src: image.src, title: image.title }));

function Gallery() {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate(); // Initialize navigate

  const handleImageClick = (index) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  const handleLightboxClose = () => {
    setOpen(false);
    navigate('/'); // Navigate to home on close
  };

  return (
    <div className="gallery-container">
      <h2>Gallery</h2>
      <div className="image-grid">
        {actualImages.map((image, index) => (
          <div key={image.id} className="image-item" onClick={() => handleImageClick(index)}>
            <img src={image.src} alt={image.title} />
            {/* You can add a caption or overlay here */}
            {/* <p>{image.title}</p> */}
          </div>
        ))}
      </div>

      <Lightbox
        open={open}
        close={handleLightboxClose} // Use the new close handler
        slides={slides}
        index={currentIndex}
        closeOnBackdropClick={true} // Ensures backdrop click triggers close
        // You can customize plugin behavior, e.g., zoom settings
        // zoom={{ 
        //   maxZoomPixelRatio: 2,
        //   doubleTapDelay: 300,
        //   doubleClickDelay: 500,
        //   doubleClickMaxStops: 2,
        //   keyboardMoveDistance: 50,
        //   wheelZoomDistanceFactor: 100,
        //   pinchZoomDistanceFactor: 100,
        //   scrollToZoom: false 
        // }}
      />
    </div>
  );
}

export default Gallery; 