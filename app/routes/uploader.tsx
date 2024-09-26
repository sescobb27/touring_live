import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { json, ActionFunction } from '@remix-run/node';
import { useActionData, Form, useSubmit } from '@remix-run/react';
import { unstable_parseMultipartFormData } from '@remix-run/node';

interface ImageInfo {
  preview: string;
  name: string;
}

interface ActionData {
  descriptions: Record<string, string>;
}

export const action: ActionFunction = async ({ request }) => {
  const uploadHandler = async (part: any) => {
    // This is where you'd typically upload the file to a storage service
    // For this example, we'll just return a mock description
    return `Description for ${part.filename}`;
  };

  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  const descriptions: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('image')) {
      descriptions[key] = value as string;
    }
  }

  return json({ descriptions });
};

export default function ImageGalleryUploader() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => ({
        preview: URL.createObjectURL(file),
        name: file.name
      }));
      setImages(prevImages => [...prevImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    images.forEach((image, index) => {
      formData.append(`image${index}`, image.name);
    });
    submit(formData, { method: 'post', encType: 'multipart/form-data' });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Image Gallery Uploader</h1>
      <Form onSubmit={handleSubmit} className="mb-4" encType="multipart/form-data">
        <div className="flex items-center justify-center w-full">
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
            </div>
            <input id="file-upload" name="images" type="file" className="hidden" onChange={handleFileChange} multiple accept="image/*" />
          </label>
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Upload Images</button>
      </Form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative border rounded-lg p-4">
            <img src={image.preview} alt={`Preview ${index}`} className="w-full h-48 object-cover mb-2 rounded" />
            <button onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full">
              <X size={16} />
            </button>
            {actionData?.descriptions[`image${index}`] && (
              <p className="text-sm text-gray-600">{actionData.descriptions[`image${index}`]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
