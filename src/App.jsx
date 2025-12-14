// File: src/App.jsx
// UPDATED - Add Reports Page Navigation

import React, { useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import GanttChart from './components/GanttChart.jsx';
import ReportsPage from './components/ReportsPage.jsx'; // ADD THIS IMPORT

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
        <GanttChart onBack={() => setView('dashboard')} />
      )}

      {view === 'reports' && (
        <ReportsPage onBack={() => setView('dashboard')} /> // ADD THIS SECTION
      )}
    </div>
  );
}

export default App;