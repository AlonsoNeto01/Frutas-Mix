export const runtime = 'edge';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">
        404 - Página não encontrada
      </h2>
      <p className="mt-4 text-neutral-500 dark:text-neutral-400">
        A página que você está procurando não existe ou foi movida.
      </p>
      <a
        href="/"
        className="mt-8 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full transition-colors"
      >
        Voltar para a Página Inicial
      </a>
    </div>
  );
}
