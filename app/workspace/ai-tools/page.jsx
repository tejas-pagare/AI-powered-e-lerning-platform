export default function AiToolsPage() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">AI Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Course Generator</h2>
          <p className="text-muted-foreground">Generate complete courses with AI.</p>
        </div>
        <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Quiz Generator</h2>
          <p className="text-muted-foreground">Create quizzes from any content.</p>
        </div>
        <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
           <h2 className="text-xl font-semibold mb-2">Notes Summarizer</h2>
           <p className="text-muted-foreground">Summarize long notes instantly.</p>
        </div>
      </div>
    </div>
  )
}
