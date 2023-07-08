"use client";

import { useEffect, useState } from "react";

export type Props = {
    // currentTime: number;
    maxTime: number;
    onSeek: (time: number) => void;
}
export const SeekPlayer = (props:Props)=>{
    const [currentTime, setCurrentTime] = useState<number>(0); // [ms
    const [play, setPlay] = useState<boolean>(false);
    const { maxTime, onSeek} = props;
    useEffect(()=>{
        if(play){
            let startTime = Date.now();
            const interval = setInterval(()=>{
                if(currentTime >= maxTime){
                    setPlay(false);
                    return;
                }
                const deltaTime = Date.now() - startTime;
                onSeek(currentTime+deltaTime);
                setCurrentTime(currentTime+deltaTime);
            }, 1000/60);
            return ()=>clearInterval(interval);
        }
    }, [play, currentTime, maxTime, onSeek]);
    const handleSeek = (event:React.ChangeEvent<HTMLInputElement>)=>{
        const time = parseInt(event.target.value);
        onSeek(time);
        setCurrentTime(time);
    }
    return <div className="seek-player flex flex-col">
        <button className="w-[50px]" onClick={()=>setPlay(!play)}>{play ? "Pause" : "Play"}</button>
        <input className="flex-1" type="range" min={0} max={maxTime} value={currentTime} onChange={handleSeek} />
        <span className="w-[100px]">{Math.floor(currentTime/1000 * 10)/10}s</span>
    </div>
}