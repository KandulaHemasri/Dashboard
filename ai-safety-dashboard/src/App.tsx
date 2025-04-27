import { useState } from 'react';
import './App.css';

type Severity = 'Low' | 'Medium' | 'High';
type SortOption = 'newest' | 'oldest';
type FilterOption = Severity | 'All';

interface Incident {
  id: number;
  title: string;
  description: string;
  severity: Severity;
  reported_at: string;
}

const initialIncidents: Incident[] = [
  {
    id: 1,
    title: 'Biased Recommendation Algorithm',
    description: 'Algorithm consistently favored certain demographics over others in job recommendation results, showing significant gender bias in technical role suggestions.',
    severity: 'Medium',
    reported_at: '2025-03-15T10:00:00Z'
  },
  {
    id: 2,
    title: 'LLM Hallucination in Critical Info',
    description: 'Large Language Model provided incorrect medical information when asked about emergency procedures, potentially endangering users who relied on the advice.',
    severity: 'High',
    reported_at: '2025-04-01T14:30:00Z'
  },
  {
    id: 3,
    title: 'Minor Data Leak via Chatbot',
    description: 'Chatbot conversation interface inadvertently exposed email addresses of other users in response to specific queries about account details.',
    severity: 'Low',
    reported_at: '2025-03-20T09:15:00Z'
  }
];

function App() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [filter, setFilter] = useState<FilterOption>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleAddIncident = (newIncident: Omit<Incident, 'id' | 'reported_at'>) => {
    const incident: Incident = {
      ...newIncident,
      id: Math.max(...incidents.map(i => i.id), 0) + 1,
      reported_at: new Date().toISOString()
    };
    setIncidents([incident, ...incidents]);
    setIsFormVisible(false);
  };

  const filteredIncidents = filter === 'All' 
    ? incidents 
    : incidents.filter(incident => incident.severity === filter);

  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    const dateA = new Date(a.reported_at).getTime();
    const dateB = new Date(b.reported_at).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>AI Safety Incident Dashboard</h1>
        <p>Monitor and report AI safety concerns</p>
      </header>

      <div className="controls-container">
        <div className="filter-controls">
          <label>
            Filter by Severity:
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as FilterOption)}
              className="filter-select"
            >
              <option value="All">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>

          <label>
            Sort by Date:
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </label>
        </div>

        <button 
          className={`toggle-form-button ${isFormVisible ? 'cancel' : ''}`}
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          {isFormVisible ? 'Cancel' : 'Report New Incident'}
        </button>
      </div>

      {isFormVisible && (
        <IncidentForm onSubmit={handleAddIncident} />
      )}

      <IncidentList incidents={sortedIncidents} />
    </div>
  );
}

interface IncidentFormProps {
  onSubmit: (incident: Omit<Incident, 'id' | 'reported_at'>) => void;
}

const IncidentForm = ({ onSubmit }: IncidentFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('Medium');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors: typeof errors = {};
    if (!title.trim()) validationErrors.title = 'Title is required';
    if (!description.trim()) validationErrors.description = 'Description is required';
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    onSubmit({ title, description, severity });
    setTitle('');
    setDescription('');
    setSeverity('Medium');
    setErrors({});
  };

  return (
    <form className="incident-form" onSubmit={handleSubmit}>
      <h2>Report New Incident</h2>
      
      <div className="form-group">
        <label htmlFor="title">Title*</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={errors.title ? 'error' : ''}
          placeholder="Enter incident title"
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description*</label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={errors.description ? 'error' : ''}
          placeholder="Describe the incident in detail"
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>
      
      <div className="form-group">
        <label>Severity</label>
        <div className="severity-options">
          {(['Low', 'Medium', 'High'] as Severity[]).map((level) => (
            <label key={level} className="severity-option">
              <input
                type="radio"
                name="severity"
                checked={severity === level}
                onChange={() => setSeverity(level)}
              />
              <span className="severity-label">{level}</span>
            </label>
          ))}
        </div>
      </div>
      
      <button type="submit" className="submit-button">
        Submit Incident
      </button>
    </form>
  );
};

interface IncidentListProps {
  incidents: Incident[];
}

const IncidentList = ({ incidents }: IncidentListProps) => {
  const [expandedIncidents, setExpandedIncidents] = useState<number[]>([]);

  const toggleIncident = (id: number) => {
    setExpandedIncidents(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  return (
    <div className="incident-list">
      {incidents.length === 0 ? (
        <div className="no-incidents">
          <p>No incidents found with current filters</p>
        </div>
      ) : (
        incidents.map(incident => (
          <div 
            key={incident.id} 
            className={`incident-card ${incident.severity.toLowerCase()}`}
          >
            <div 
              className="incident-header"
              onClick={() => toggleIncident(incident.id)}
            >
              <div className="incident-info">
                <h3>{incident.title}</h3>
                <div className="incident-meta">
                  <span className={`severity-badge ${incident.severity.toLowerCase()}`}>
                    {incident.severity}
                  </span>
                  <span className="date">
                    {new Date(incident.reported_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <button 
                className="toggle-details"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleIncident(incident.id);
                }}
              >
                {expandedIncidents.includes(incident.id) ? (
                  <>
                    <span>Hide Details</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>View Details</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            
            {expandedIncidents.includes(incident.id) && (
              <div className="incident-description">
                <p>{incident.description}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default App;