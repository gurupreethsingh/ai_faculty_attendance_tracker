// Auto-generated fallback (model output invalid)
const GeneratedStudentDashboard = ({ data }) => {
  const students = data?.students || [];
  const meta = data?.meta || {};

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="text-xl font-semibold">
          Student Performance Dashboard
        </div>
        <div className="text-sm text-slate-600">
          {meta.department} • {meta.semester}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-600">
            <tr>
              <th>Name</th>
              <th>GPA</th>
              <th>Attendance</th>
              <th>Risk</th>
              <th>Math</th>
              <th>CS</th>
              <th>English</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={i} className="border-t">
                <td>{s.name}</td>
                <td>{s.gpa}</td>
                <td>{s.attendance}%</td>
                <td>{s.risk}</td>
                <td>{s.math}</td>
                <td>{s.cs}</td>
                <td>{s.english}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GeneratedStudentDashboard;
