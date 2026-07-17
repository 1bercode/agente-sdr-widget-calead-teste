export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Calead</h1>
        <p className="text-slate-600">
          Este é o servidor do widget do agente qualificador. A interface de
          chat vive em <code className="px-1 bg-slate-100 rounded">/widget</code>,
          e o snippet de embed fica em{" "}
          <code className="px-1 bg-slate-100 rounded">/embed.js</code>.
        </p>
        <p className="text-slate-500 text-sm">
          Veja <code className="px-1 bg-slate-100 rounded">/test-site</code> para
          um exemplo de página com o widget embutido.
        </p>
      </div>
    </main>
  );
}
