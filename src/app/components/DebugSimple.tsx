interface DebugSimpleProps {
  onNavigate: (page: string) => void;
}

export function DebugSimple({ onNavigate }: DebugSimpleProps) {
  return (
    <div className="min-h-screen bg-black text-white p-20">
      <h1 className="text-4xl font-bold mb-8">DEBUG PAGE WORKS!</h1>
      <p className="text-xl mb-4">Se você está vendo isso, a rota /debug está funcionando!</p>
      <button
        onClick={() => onNavigate('home')}
        className="bg-red-600 px-6 py-3 rounded-lg text-white font-bold"
      >
        Voltar para Home
      </button>
    </div>
  );
}
