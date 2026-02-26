const TypingIndicator = ({ name }: { name?: string }) => (
  <div className="flex items-center gap-2 px-4 py-1">
    <div className="bg-bubble-other rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
      {name && <span className="text-[11px] text-muted-foreground">{name}</span>}
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-typing animate-typing-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default TypingIndicator;
