export default function DatasetLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      <p className="mt-4 text-muted-foreground">Loading dataset...</p>
    </div>
  )
}
