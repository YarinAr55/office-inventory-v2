export default function App() {
  return (
    <div
      style={{
        fontFamily: "Arial",
        padding: "40px",
        direction: "rtl",
        background: "#f4f7fb",
        minHeight: "100vh",
      }}
    >
      <h1>ניהול מלאי ציוד משרדי</h1>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginTop: "20px",
        }}
      >
        <h2>המוצרים במלאי</h2>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>מוצר</th>
              <th>כמות</th>
              <th>מינימום</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>עט כדורי כחול</td>
              <td>120</td>
              <td>50</td>
            </tr>

            <tr>
              <td>מחברת A4</td>
              <td>14</td>
              <td>20</td>
            </tr>

            <tr>
              <td>עט הדגשה ורוד</td>
              <td>0</td>
              <td>40</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
