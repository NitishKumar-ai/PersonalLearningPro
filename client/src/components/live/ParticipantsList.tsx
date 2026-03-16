import { useParticipantIds, useParticipantProperty, useLocalSessionId } from '@daily-co/daily-react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface ParticipantRowProps {
    id: string;
    isLocal?: boolean;
}

function ParticipantRow({ id, isLocal }: ParticipantRowProps) {
    const name = useParticipantProperty(id, 'user_name') || 'Guest';
    const isVideoOff = useParticipantProperty(id, 'tracks.video.state') !== 'playable';
    const isAudioOff = useParticipantProperty(id, 'tracks.audio.state') !== 'playable';

    return (
        <div className="flex items-center justify-between py-2 px-4 hover:bg-zinc-800/50 rounded-lg group transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm shrink-0">
                    {name.charAt(0).toUpperCase()}
                </div>
                <span className="text-zinc-200 text-sm font-medium truncate max-w-[120px]">
                    {name} {isLocal && <span className="text-zinc-500 ml-1">(You)</span>}
                </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 shrink-0">
                {isAudioOff ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
                {isVideoOff ? <VideoOff className="w-4 h-4 text-red-400" /> : <Video className="w-4 h-4" />}
            </div>
        </div>
    );
}

export function ParticipantsList() {
    const localSessionId = useLocalSessionId();
    const remoteParticipantIds = useParticipantIds({ filter: 'remote' });

    return (
        <div className="flex flex-col h-full bg-zinc-950 w-80 shrink-0">
            <div className="p-4 border-b border-zinc-800 font-semibold text-white flex justify-between items-center bg-zinc-950">
                <span>Participants</span>
                <span className="bg-zinc-800 text-xs px-2 py-0.5 rounded-full text-zinc-400">
                    {remoteParticipantIds.length + (localSessionId ? 1 : 0)}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-zinc-950">
                {localSessionId && <ParticipantRow id={localSessionId} isLocal={true} />}
                {remoteParticipantIds.map((id) => (
                    <ParticipantRow key={id} id={id} />
                ))}
            </div>
        </div>
    );
}
