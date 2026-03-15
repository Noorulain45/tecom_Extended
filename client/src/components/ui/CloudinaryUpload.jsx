import { useEffect, useRef } from "react";

export default function CloudinaryUpload({ onUpload }) {
  const widgetRef = useRef(null);

  useEffect(() => {
    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
        uploadPreset: "my_app_preset", 
        multiple: false,       // single image upload
        resourceType: "image", // images only
      },
      (error, result) => {
        if (!error && result.event === "success") {
          onUpload(result.info.secure_url);
        }
      }
    );
  }, []);

  return (
    <button onClick={() => widgetRef.current.open()}>
      Upload Image
    </button>
  );
}