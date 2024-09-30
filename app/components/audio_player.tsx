import React, { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMediaSourceSupported, setIsMediaSourceSupported] = useState(true);

  useEffect(() => {
    setIsMediaSourceSupported('MediaSource' in window);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isMediaSourceSupported) {
      // Fallback for browsers that don't support MediaSource
      audio.src = src;
      return;
    }

    const mediaSource = new MediaSource();
    audio.src = URL.createObjectURL(mediaSource);

    let sourceBuffer: SourceBuffer | undefined;

    mediaSource.addEventListener('sourceopen', async () => {
      try {
        sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
        const response = await fetch(src);
        const reader = response.body.getReader();

        const readChunk = async () => {
          const { done, value } = await reader.read();

          if (done) {
            mediaSource.endOfStream();
            return;
          }

          if (sourceBuffer?.updating) {
            sourceBuffer.addEventListener('updateend', () => {
              sourceBuffer.appendBuffer(value);
              readChunk();
            }, { once: true });
          } else {
            sourceBuffer?.appendBuffer(value);
            readChunk();
          }
        };

        readChunk();
      } catch (error) {
        console.error('Error fetching audio data:', error);
        mediaSource.endOfStream('decode');

        // Fallback to standard audio streaming if MediaSource fails
        audio.src = src;
      }
    });

    return () => {
      if (sourceBuffer && mediaSource.readyState === 'open') {
        try {
          mediaSource.endOfStream();
        } catch (error) {
          console.error('Error ending MediaSource stream:', error);
        }
      }
      audio.src = '';
    };
  }, [src, isMediaSourceSupported]);

  return (
    <div>
      <audio ref={audioRef} controls />
    </div>
  );
};

export default AudioPlayer;
