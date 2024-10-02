import type { MetaFunction } from "@remix-run/node";
import ImageUploadAndCamera from "./camera"
import { Camera, Volume2, Globe, History } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [
    { title: "Your personal AI tour guide, anywhere in the world!" },
    { name: "description", content: "Welcome to Touring Live AI!" },
  ];
};

// TravelLens AI

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-green-400 text-white">
      <header className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center">Touring Live AI</h1>
        <p className="text-xl text-center mt-2">Your personal AI tour guide, anywhere in the world!</p>
      </header>

      <main className="container mx-auto px-4">
        <section className="my-12 text-center">
          <h2 className="text-3xl font-semibold mb-6">Explore the World Like Never Before</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Camera className="mx-auto" size={48} />, text: "Snap or upload a photo" },
              { icon: <Globe className="mx-auto" size={48} />, text: "Get instant information" },
              { icon: <Volume2 className="mx-auto" size={48} />, text: "Listen to audio guides" },
              { icon: <History className="mx-auto" size={48} />, text: "Learn fascinating history" }
            ].map((feature, index) => (
              <div key={index} className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-lg">
                {feature.icon}
                <p className="mt-4 text-lg">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="my-12">
          <div className="bg-white bg-opacity-20 rounded-lg p-8 backdrop-blur-lg">
            <h2 className="text-3xl font-semibold mb-4">How It Works</h2>
            <ol className="list-decimal list-inside space-y-4">
              <li>Take a photo or upload an image of any landmark, artwork, or place of interest.</li>
              <li>Our AI instantly recognizes the subject and provides detailed information.</li>
              <li>Read the fascinating facts or listen to the audio guide.</li>
              <li>Explore more by asking questions or requesting additional details!</li>
            </ol>
          </div>
        </section>

        <section className="my-12 text-center">
          <h2 className="text-3xl font-semibold mb-6">Ready to Start Your Adventure?</h2>
          <button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-6 text-xl transition duration-300 transform hover:scale-105">
            <ImageUploadAndCamera />
          </button>
        </section>
      </main>

      <footer className="bg-blue-600 py-6 mt-12">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Touring Live. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
