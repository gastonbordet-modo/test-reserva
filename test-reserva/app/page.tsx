export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold text-text-home">
        Bienvenido a modo reservas
      </h1>
      <input
        type="text"
        placeholder="¿Que quieres reservar?"
        className="w-full max-w-md border border-gray-20 bg-paper text-text-light placeholder:text-text-gray rounded-modo-button px-4 py-3 shadow-modo focus:outline-none focus:border-brand"
      />
    </main>
  );
}
