import React, { useRef } from "react";
import { useAuth } from '../../contexts/AuthContext';

const FaceIDButton = () => {
  const { faceIDLogin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file); // assume que o backend espera 'image'

    try {
      await faceIDLogin(formData);
    } catch (error) {
      console.error("Erro no login FaceID:", error);
    }
  };

  return (
    <>
      <button onClick={handleButtonClick}>FaceID</button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
};

export default FaceIDButton;
