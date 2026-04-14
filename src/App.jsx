// File: src/App.jsx
// UPDATED - Add Reports Page Navigation

import React, { useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import GanttChart from './components/GanttChart.jsx';
import ReportsPage from './components/ReportsPage.jsx'; // ADD THIS IMPORT
import './migrationRunner.js'; // ONE-TIME: Remove after running migration

function App() {
  const [view, setView] = useState('dashboard'); // dashboard, gantt, reports

  return (
    <div className="App">
      {view === 'dashboard' && (
        <Dashboard 
          onViewGantt={() => setView('gantt')}
          onViewReports={() => setView('reports')} // ADD THIS PROP
        />
      )}
      
      {view === 'gantt' && (
        <GanttChart
          onBack={() => setView('dashboard')}
          onViewReports={() => setView('reports')}
        />
      )}

      {view === 'reports' && (
        <ReportsPage
          onBack={() => setView('dashboard')}
          onViewGantt={() => setView('gantt')}
        />
      )}
    </div>
  );
}

export default App;