export default function CollectionPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Collection</h1>
      <p className="text-muted-foreground">
        Welcome to collection page. Collection ID: {params.id}
      </p>
      <p className="text-muted-foreground text-sm">
        Bookmarks in this collection will appear here.
      </p>
    </div>
  );
}
