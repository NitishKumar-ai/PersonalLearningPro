import { useVideoTrack, useAudioTrack, useParticipantProperty } from '@daily-co/daily-react';
import { useEffect, useRef } from 'react';
import { MicOff, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface VideoTileProps {
    id: string;
    isLocal?: boolean;
}

export function VideoTile({ id, isLocal }: VideoTileProps) {
    const videoState = useVideoTrack(id);
    const audioState = useAudioTrack(id);

    const isMicMuted = useParticipantProperty(id, 'tracks.audio.state') !== 'playable';
    const username = useParticipantProperty(id, 'user_name') || 'Guest';

    const videoElement = useRef<HTMLVideoElement>(null);
    const audioElement = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (videoElement.current && videoState.persistentTrack) {
            videoElement.current.srcObject = new MediaStream([videoState.persistentTrack]);
        }
    }, [videoState.persistentTrack]);

    useEffect(() => {
        if (audioElement.current && audioState.persistentTrack && !isLocal) {
            audioElement.current.srcObject = new MediaStream([audioState.persistentTrack]);
        }
    }, [audioState.persistentTrack, isLocal]);

    const isVideoOff = videoState.state !== 'playable';

    return (
        <Card className="relative overflow-hidden bg-zinc-900 group rounded-xl border-zinc-800 shadow-xl aspect-video flex items-center justify-center">
            {isVideoOff ? (
                <div className="flex flex-col items-center justify-center text-zinc-500">
                    <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                        <User className="w-10 h-10" />
                    </div>
                    <span className="font-medium">{username}</span>
                </div>
            ) : (
                <video
                    autoPlay
                    muted={isLocal}
                    playsInline
                    ref={videoElement}
                    className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
                />
            )}

            {!isLocal && <audio autoPlay playsInline ref={audioElement} />}

            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-medium flex items-center gap-2">
                    {username}
                </div>
                {isMicMuted && (
                    <div className="bg-red-500/80 backdrop-blur-md p-1.5 rounded-lg text-white">
                        <MicOff className="w-4 h-4" />
                    </div>
                )}
            </div>
        </Card>
    );
}
