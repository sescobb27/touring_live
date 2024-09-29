import React, { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!('MediaSource' in window)) {
      console.error('MediaSource API is not supported in this browser');
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

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

          sourceBuffer?.appendBuffer(value);
          await new Promise<void>((resolve) => {
            sourceBuffer?.addEventListener('updateend', () => resolve(), { once: true });
          });

          readChunk();
        };

        readChunk();
      } catch (error) {
        console.error('Error fetching audio data:', error);
        mediaSource.endOfStream('decode');
      }
    });

    return () => {
      if (sourceBuffer && sourceBuffer.updating) {
        sourceBuffer.abort();
      }
      audio.src = '';
    };
  }, [src]);

  return (
    <div>
      <audio ref={audioRef} controls />
    </div>
  );
};

export default AudioPlayer;
