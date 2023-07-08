"use client";

import { useEffect, useState } from "react";

export type Props = {
  // currentTime: number;
  maxTime: number;
  onSeek: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
};
export const SeekPlayer = (props: Props) => {
  const [currentTime, setCurrentTime] = useState<number>(0); // [ms
  const [play, setPlay] = useState<boolean>(false);
  const { maxTime, onSeek } = props;
  useEffect(() => {
    if (play) {
      let startTime = Date.now();
      const interval = setInterval(() => {
        if (currentTime >= maxTime) {
          setPlay(false);
          return;
        }
        const deltaTime = Date.now() - startTime;
        onSeek(currentTime + deltaTime);
        setCurrentTime(currentTime + deltaTime);
      }, 1000 / 60);
      return () => clearInterval(interval);
    }
  }, [play, currentTime, maxTime, onSeek]);
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(event.target.value);
    onSeek(time);
    setCurrentTime(time);
  };
  return (
    <div className="seek-player flex flex-col">
      <div className="flex flex-row items-center px-2">
        <button
          className="w-[80px] rounded bg-black text-white px-2 py-2"
          onClick={() => {
            if (play) props.onPause();
            else props.onPlay();
            return setPlay(!play);
          }}
        >
          {play ? "Pause" : "Play"}
        </button>
        <span className="w-[50px] ml-2">
          {Math.floor((currentTime / 1000) * 10) / 10}s
        </span>
        <span className="w-[50px]">
          / {Math.floor((maxTime / 1000) * 10) / 10}s
        </span>
      </div>
      <input
        className="flex-1"
        type="range"
        min={0}
        max={maxTime}
        value={currentTime}
        onChange={handleSeek}
      />
    </div>
  );
};
