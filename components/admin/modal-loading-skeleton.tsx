export function ModalLoadingSkeleton({ title }: { title: string }) {
  return (
    <div className="fixed inset-0 isolate z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs">
      <div className="fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 ring-1 ring-foreground/10 sm:max-w-2xl">
        <p className="font-heading text-xl text-foreground">{title}</p>
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-4 w-1/3 rounded-md bg-muted" />
          <div className="h-10 rounded-md bg-muted" />
          <div className="h-4 w-1/4 rounded-md bg-muted" />
          <div className="h-24 rounded-md bg-muted" />
          <div className="h-4 w-1/4 rounded-md bg-muted" />
          <div className="h-10 rounded-md bg-muted" />
        </div>
      </div>
    </div>
  )
}
