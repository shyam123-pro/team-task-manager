export default function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="glass rounded-md p-12 text-center">
      <div className="text-5xl mb-4">✨</div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
        {description ?? "This area is part of your workspace and will be available soon."}
      </p>
    </div>
  );
}
