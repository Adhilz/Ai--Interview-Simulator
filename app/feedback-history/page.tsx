export default function FeedbackHistoryPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Feedback & History</h1>
      <p className="text-muted-foreground mb-8">List of your past interviews and feedback. (Mock page)</p>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li>Interview 1 - 2024-01-15 - 92%</li>
        <li>Interview 2 - 2024-01-10 - 88%</li>
        <li>Interview 3 - 2024-01-05 - 85%</li>
      </ul>
    </div>
  );
}
