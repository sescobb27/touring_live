import React, { useState, useRef, ChangeEvent } from 'react';

interface ImageFile {
  file: File;
  preview: string;
}

const ImageUploadAndCamera: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width = width * scale;
          height = height * scale;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          blob => {
            if (blob) {
              const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
              resolve(resizedFile);
            } else {
              reject(new Error('Canvas is empty'));
            }
          },
          'image/jpeg',
          0.7 // Compression quality
        );
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const resizedFilesPromises = files.map(file => resizeImage(file, 1024, 1024));
      try {
        setImageError(null); // Reset previous error
        const resizedFiles = await Promise.all(resizedFilesPromises);
        addImagesToState(resizedFiles);
      } catch (error) {
        console.error('Error resizing images:', error);
        setImageError('Failed to process images. Please try again.');
      }
    }
  };

  const addImagesToState = (files: File[]) => {
    const newImages: ImageFile[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prevImages => [...prevImages, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const openCamera = async () => {
    setIsCameraOpen(true);
    setCameraError(null); // Reset any previous error
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing the camera:", err);
      setCameraError('Unable to access the camera. Please check your camera permissions.');
    }
  };

  const takePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);

      canvas.toBlob(async blob => {
        if (blob) {
          let file = new File([blob], "camera_photo.jpg", { type: "image/jpeg" });
          // Resize the image
          try {
            file = await resizeImage(file, 1024, 1024);
            addImagesToState([file]);
            closeCamera();
          } catch (error) {
            console.error('Error resizing image:', error);
            setImageError('Failed to process the photo. Please try again.');
          }
        }
      }, 'image/jpeg');
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject instanceof MediaStream) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`images[]`, image.file);
    });

    try {
      setUploadError(null); // Reset any previous error
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Upload successful:', data);
      // Handle the response from the server here
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError('Failed to upload images. Please try again.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Image Upload and Camera</h1>
      <div className="flex space-x-4 mb-4">
        <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-blue-500 text-white rounded">
          Upload Images
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept="image/*"
        />
        <button onClick={openCamera} className="px-4 py-2 bg-green-500 text-white rounded">
          Take Photo
        </button>
      </div>

      {imageError && <p className="text-red-500 mb-4">{imageError}</p>}

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            {cameraError ? (
              <div>
                <p className="text-red-500">{cameraError}</p>
                <button onClick={closeCamera} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
                  Close Camera
                </button>
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full max-w-md" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex justify-between mt-4">
                  <button onClick={takePhoto} className="px-4 py-2 bg-blue-500 text-white rounded">Take Photo</button>
                  <button onClick={closeCamera} className="px-4 py-2 bg-red-500 text-white rounded">Close Camera</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative">
            <img src={image.preview} alt={`Preview ${index}`} className="w-full h-48 object-cover rounded" />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
            >
              X
            </button>
          </div>
        ))}
      </div>

      {uploadError && <p className="text-red-500 mt-4">{uploadError}</p>}

      {images.length > 0 && (
        <button onClick={handleSubmit} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">
          Upload Images
        </button>
      )}
    </div>
  );
};

export default ImageUploadAndCamera;
