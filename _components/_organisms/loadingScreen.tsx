

export const LoadingScreen = () => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-4">
                    <span className="h-3 w-3 bg-primary animate-blink-pixel" />
                    <span className="h-3 w-3 bg-primary animate-blink-pixel [animation-delay:200ms]" />
                    <span className="h-3 w-3 bg-primary animate-blink-pixel [animation-delay:400ms]" />
                </div>
                <p className="text-xs font-display tracking-widest text-muted-foreground">CARREGANDO...</p>
            </div>
        </div>
    )
}