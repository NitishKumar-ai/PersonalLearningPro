export default function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-1 py-0.5">
            {[0, 1, 2].map(i => (
                <span
                    key={i}
                    className="block h-2 w-2 rounded-full bg-typing animate-typing-dot"
                    style={{ animationDelay: `${i * 0.2}s` }}
                />
            ))}
        </div>
    );
}
