import { useMediaControls } from '@/hooks/live/useMediaControls';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, MessageSquare } from 'lucide-react';

interface ControlBarProps {
    onLeave: () => void;
    onToggleChat?: () => void;
    onToggleParticipants?: () => void;
    isChatOpen?: boolean;
    isParticipantsOpen?: boolean;
    isHost?: boolean;
}

export function ControlBar({
    onLeave,
    onToggleChat,
    onToggleParticipants,
    isChatOpen,
    isParticipantsOpen,
    isHost
}: ControlBarProps) {
    const { isVideoEnabled, isAudioEnabled, toggleVideo, toggleAudio } = useMediaControls();

    return (
        <div className="h-20 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 z-10 w-full shrink-0">
            <div className="flex items-center gap-4 flex-1">
                <span className="text-zinc-400 font-medium text-sm hidden md:inline-block">EduAI Live</span>
            </div>

            <div className="flex items-center justify-center gap-4 flex-1">
                <Button
                    variant={isAudioEnabled ? "outline" : "destructive"}
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={toggleAudio}
                >
                    {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                <Button
                    variant={isVideoEnabled ? "outline" : "destructive"}
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={toggleVideo}
                >
                    {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                <Button
                    variant="destructive"
                    className="rounded-full px-6 h-12 font-medium"
                    onClick={onLeave}
                >
                    <PhoneOff className="w-5 h-5 mr-2" />
                    {isHost ? "End Class" : "Leave"}
                </Button>
            </div>

            <div className="flex items-center justify-end gap-3 flex-1">
                <Button
                    variant={isParticipantsOpen ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-full w-10 h-10 text-zinc-300"
                    onClick={onToggleParticipants}
                >
                    <Users className="w-5 h-5" />
                </Button>
                <Button
                    variant={isChatOpen ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-full w-10 h-10 text-zinc-300"
                    onClick={onToggleChat}
                >
                    <MessageSquare className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
