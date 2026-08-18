import React from 'react';

function App() {
  return (
    <div style={styles.page} dir="rtl">
      <style>{`
        body {
          margin: 0;
          background-color: #0f172a;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #f8fafc;
        }
        * { box-sizing: border-box; }
      `}</style>

      {/* כותרת עליונה */}
      <header style={styles.header}>
        <h1 style={styles.title}>✨ מערכת ניהול מלאי</h1>
        <p style={styles.subtitle}>עיצוב נקי ומוכן לעבודה</p>
      </header>

      {/* תוכן מרכזי מעוצב ונקי */}
      <main style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>ברוכים הבאים למערכת</h2>
          <p style={styles.cardText}>כאן תוכל להתחיל להוסיף את הרכיבים והעיצובים שלך בשקט ובנחת, על גבי תשתית מעוצבת ומוכנה מראש.</p>
          <button style={styles.button}>לחצן לדוגמה</button>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    padding: '30px 40px',
    borderBottom: '1px solid #3730a3',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    margin: '0 0 8px 0',
    color: '#ffffff',
  },
  subtitle: {
    color: '#c7d2fe',
    fontSize: '0.95rem',
    margin: 0,
  },
  container: {
    flex: 1,
    maxWidth: '800px',
    width: '100%',
    margin: '40px auto',
    padding: '0 20px',
  },
  card: {
    background: '#1e293b',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #334155',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#f1f5f9',
    marginTop: 0,
    marginBottom: '12px',
  },
  cardText: {
    color: '#94a3b8',
    fontSize: '1rem',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  button: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
  },
};

export default App;
