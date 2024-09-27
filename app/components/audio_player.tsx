import React, { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  stream: ReadableStream<Uint8Array>;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ stream }) => {
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
        const reader = stream.getReader();

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
  }, [stream]);

  return (
    <div>
      <audio ref={audioRef} controls />
    </div>
  );
};

export default AudioPlayer;
