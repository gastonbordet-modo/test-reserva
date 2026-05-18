export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Bienvenido a modo reservas</h1>
      <input
        type="text"
        placeholder="¿Que quieres reservar?"
        className="w-full max-w-md border border-zinc-300 rounded px-3 py-2"
      />
    </main>
  );
}
