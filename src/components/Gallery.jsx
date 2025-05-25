import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/Gallery.css'; // Updated import path
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Construct image paths using Vite's base URL environment variable
const actualImages = [
  { id: 1, src: '/images/DSCF2100.JPG', title: 'Photography 1' },
  { id: 2, src: '/images/DSCF1847.JPG', title: 'Photography 2' },
  { id: 3, src: '/images/DSCF2283.jpg', title: 'Photography 3' },
  { id: 4, src: '/images/DSCF2205.jpg', title: 'Photography 4' },
  { id: 5, src: '/images/DSCF2270.jpg', title: 'Photography 5' },
  { id: 6, src: '/images/DSC01410.jpg', title: 'Photography 6' },
  { id: 7, src: '/images/DSC01583.jpg', title: 'Photography 7' },
  { id: 8, src: '/images/DSC01591.jpg', title: 'Photography 8' },

  // Add more images here if you have them
];

// Prepare slides for the lightbox (it expects an array of objects with a `src` property)
const slides = actualImages.map(image => ({ src: image.src, title: image.title }));

function Gallery() {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate(); // Initialize navigate
  const imageRefs = useRef([]); // To store refs to image elements

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Stop observing once visible
          }
        });
      },
      {
        rootMargin: '0px', // No margin around the viewport
        threshold: 0.1, // Trigger when 10% of the image is visible
      }
    );

    // Add current image refs to the observer
    imageRefs.current.forEach((ref) => {
      if (ref) { // Check if ref is not null
        observer.observe(ref);
      }
    });

    // Cleanup function
    return () => {
      imageRefs.current.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
      observer.disconnect();
    };
  }, [actualImages]); // Re-run effect if images change, though not expected here

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
            {/* Assign a ref to each image */}
            <img 
              ref={el => imageRefs.current[index] = el} 
              src={image.src} 
              alt={image.title} 
            />
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
      />
    </div>
  );
}

export default Gallery; 