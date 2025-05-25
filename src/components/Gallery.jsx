import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/Gallery.css'; // Updated import path
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import exifr from 'exifr'; // Import exifr

// Dynamically import image modules from the public/images folder
const imageModules = import.meta.glob('/public/images/**/*.{JPG,jpg,jpeg,png,gif}', { eager: true });

// Prepare slides for the lightbox (will be updated once actualImages is populated with EXIF)
let slides = [];
let firstImageExifLogged = false; // Flag to ensure we only log EXIF for the first image

function formatShutterSpeed(exposureTime) {
  if (!exposureTime) return 'N/A';
  if (exposureTime < 1) {
    const reciprocal = Math.round(1 / exposureTime);
    return `1/${reciprocal}s`;
  }
  return `${exposureTime}s`;
}

function Gallery() {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate(); // Initialize navigate
  const imageRefs = useRef([]); // To store refs to image elements
  const [galleryImages, setGalleryImages] = useState([]); // State for images with EXIF data

  useEffect(() => {
    firstImageExifLogged = false; 
    const fetchImageMetadata = async () => {
      const loadedImages = [];
      let currentId = 1;

      for (const modulePath in imageModules) {
        const module = imageModules[modulePath];
        let src = module.default;
        if (src && src.startsWith('/public/')) {
          src = src.substring('/public'.length);
        }

        try {
          const response = await fetch(src);
          const imageBlob = await response.blob();
          
          let exifData;
          if (!firstImageExifLogged) {
            exifData = await exifr.parse(imageBlob, true); 
            console.log("Full EXIF data for first image (", src, "):", exifData);
            firstImageExifLogged = true;
          } else {
            // Remove ISOSpeedRatings from EXIF tags to fetch
            exifData = await exifr.parse(imageBlob, ['FNumber', 'FocalLength', 'Model', 'ExposureTime']);
          }
          
          const filename = src.substring(src.lastIndexOf('/') + 1);
          loadedImages.push({
            id: currentId++,
            src: src,
            // title: `Image: ${filename}`,
            fStop: exifData?.FNumber ? `f/${exifData.FNumber}` : 'N/A',
            focalLength: exifData?.FocalLength ? `${exifData.FocalLength}mm` : 'N/A',
            camera: exifData?.Model || 'N/A',
            shutterSpeed: formatShutterSpeed(exifData?.ExposureTime),
            // No longer adding iso property
          });
        } catch (error) {
          console.error("Error parsing EXIF data for image:", src, error);
          const filename = src.substring(src.lastIndexOf('/') + 1);
          loadedImages.push({
            id: currentId++,
            src: src,
            // title: `Image: ${filename}`,
            fStop: 'N/A',
            focalLength: 'N/A',
            camera: 'N/A',
            shutterSpeed: 'N/A',
            // No longer adding iso property
          });
        }
      }
      setGalleryImages(loadedImages);
      slides = loadedImages.map(image => ({ src: image.src, title: image.title }));
    };

    fetchImageMetadata();
  }, []); // Empty dependency array: run once on mount

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
  }, [galleryImages]); // Re-run effect if images change, though not expected here

  const handleImageClick = (index) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  const handleLightboxClose = () => {
    setOpen(false);
    navigate('/'); // Navigate to home on close
  };

  if (galleryImages.length === 0) {
    return <div className="gallery-container"><h2>Loading Gallery...</h2></div>; // Loading state
  }

  return (
    <div className="gallery-container">
      <h2>Gallery</h2>
      <div className="image-grid">
        {galleryImages.map((image, index) => (
          <div key={image.id} className="image-item" onClick={() => handleImageClick(index)}>
            {/* Assign a ref to each image */}
            <img 
              ref={el => imageRefs.current[index] = el} 
              src={image.src} 
              alt={image.title || `Image ${image.id}`} // Fallback for alt text
            />
            <div className="image-overlay">
              {/* <p className="overlay-title">{image.title || `Image ${image.id}`}</p> */}
              <div className="overlay-metadata">
                <p>Camera: {image.camera}</p>
                <p>Focal Length: {image.focalLength}</p>
                <p>Aperture: {image.fStop}</p>
                <p>Shutter Speed: {image.shutterSpeed}</p>
              </div>
            </div>
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