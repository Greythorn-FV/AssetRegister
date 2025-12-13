import React, { useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import GanttChart from './components/GanttChart.jsx';

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'gantt'

  return (
    <div style={styles.app}>
      {currentView === 'dashboard' && (
        <Dashboard onViewGantt={() => setCurrentView('gantt')} />
      )}
      {currentView === 'gantt' && (
        <GanttChart onBack={() => setCurrentView('dashboard')} />
      )}
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    background: '#f5f7fa'
  }
};

export default App;