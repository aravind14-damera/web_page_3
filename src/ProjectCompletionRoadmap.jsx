import React, { useMemo, useState, useEffect, useCallback } from 'react';
import './roadmap.css';

const phasesData = [
  {
    id: 'phase-1',
    title: 'Phase 1',
    description: 'Foundation & Setup',
    tasks: [
      {
        id: 't1',
        name: 'Foundation Setup',
        description: 'Establish core architecture and repositories.',
        level: 3,
      },
      {
        id: 't2',
        name: 'Design System',
        description: 'Build reusable UI kit and tokens.',
        level: 2,
      },
      {
        id: 't3',
        name: 'API Contracts',
        description: 'Finalize schemas and contracts with backend.',
        level: 4,
      },
    ],
  },
  {
    id: 'phase-2',
    title: 'Phase 2',
    description: 'Development & Quality',
    tasks: [
      {
        id: 't4',
        name: 'Feature Assembly',
        description: 'Integrate core flows with real data.',
        level: 2,
      },
      {
        id: 't5',
        name: 'Quality Gate',
        description: 'Automated tests, linting, performance budget.',
        level: 3,
      },
      {
        id: 't6',
        name: 'UAT Prep',
        description: 'Polish UI/UX and collect stakeholder feedback.',
        level: 1,
      },
    ],
  },
  {
    id: 'phase-3',
    title: 'Phase 3',
    description: 'Launch & Handover',
    tasks: [
      {
        id: 't7',
        name: 'Launch Readiness',
        description: 'Finalize release notes and rollout plan.',
        level: 1,
      },
      {
        id: 't8',
        name: 'Stability Watch',
        description: 'Post-launch monitoring and rapid fixes.',
        level: 0,
      },
      {
        id: 't9',
        name: 'Handover',
        description: 'Transition documentation and ownership.',
        level: 0,
      },
    ],
  },
];

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    if (!onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type || 'success'}`}>
      <span>{message}</span>
      {onClose && (
        <button className="toast-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
};

const PhaseCard = ({ phase, defaultOpen = false, onSuccess, onUpdateTaskLevel, onError }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  // Safety checks for phase and tasks
  if (!phase) return null;
  const tasks = phase.tasks || [];
  const taskCount = tasks.length;
  const completedTasks = tasks.filter((t) => t && t.level === 5).length;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check both MIME type and file extension for better compatibility
      const isPDF = selectedFile.type === 'application/pdf' || 
                    selectedFile.name.toLowerCase().endsWith('.pdf');
      if (isPDF) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
      } else {
        if (onError) {
          onError('Please upload a PDF file only.');
        } else {
          // Fallback to alert if onError not provided
          alert('Please upload a PDF file only.');
        }
        e.target.value = '';
      }
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!notes.trim() && !file) {
      if (onError) {
        onError('Please add notes or upload a PDF file before submitting.');
      } else {
        // Fallback to alert if onError not provided
        alert('Please add notes or upload a PDF file before submitting.');
      }
      return;
    }

    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setShowModal(false);
      setNotes('');
      setFile(null);
      setFileName('');
      if (onSuccess) {
        onSuccess(`All tasks for ${phase.title} submitted successfully!`);
      }
    }, 1500);
  }, [notes, file, phase.title, onSuccess, onError]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && showModal) {
      setShowModal(false);
    }
    if (e.key === 'Enter' && e.ctrlKey && showModal && !submitting) {
      handleSubmit();
    }
  }, [showModal, submitting, handleSubmit]);

  useEffect(() => {
    if (showModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showModal, handleKeyDown]);

  return (
    <div className="phase-card">
      <button
        className="phase-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`${open ? 'Collapse' : 'Expand'} ${phase.title}`}
      >
        <div className="phase-header-content">
          <div>
            <p className="phase-label">{phase.title}</p>
            <p className="phase-sub">{phase.description || 'Ongoing Task Details'}</p>
          </div>
          <div className="phase-stats">
            <span className="task-count">
              {completedTasks}/{taskCount} tasks completed
            </span>
          </div>
        </div>
        <span className={`arrow ${open ? 'open' : ''}`} aria-hidden>
          ▾
        </span>
      </button>

      <div className={`phase-body ${open ? 'show' : ''}`}>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks available for this phase.</p>
          </div>
        ) : (
          <div className="tasks">
            {tasks.map((task, idx) => {
              if (!task) return null;
              return (
              <div
                key={task.id}
                className="task-card"
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <div className="task-top">
                  <div className="task-number">Task {idx + 1}</div>
                  <div className="task-name">{task.name}</div>
                </div>
                <div className="task-desc">{task.description}</div>

                <div className="task-progress">
                  <div className="task-progress-bar">
                    <div
                      className="task-progress-fill"
                      style={{ width: `${(task.level / 5) * 100}%` }}
                      role="progressbar"
                      aria-valuenow={task.level}
                      aria-valuemin="0"
                      aria-valuemax="5"
                      aria-label={`${task.name} progress: ${task.level} out of 5`}
                    />
                  </div>
                  <span className="task-progress-label">
                    {task.level}/5 completion
                  </span>
                </div>

                <div className="progress-scale" role="group" aria-label="Progress scale">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`scale-dot ${task.level >= num ? 'active' : ''} ${task.level === num ? 'current' : ''}`}
                      title={`Click to set progress to level ${num}`}
                      onClick={() => onUpdateTaskLevel && onUpdateTaskLevel(phase.id, task.id, num)}
                      aria-label={`Set ${task.name} progress to level ${num}`}
                    >
                      <span>{num}</span>
                    </button>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        )}

        <div className="submit-all">
          <button
            className="cta"
            onClick={() => setShowModal(true)}
            disabled={tasks.length === 0}
            aria-label={`Submit all tasks for ${phase?.title || 'this phase'}`}
          >
            Submit All Tasks
          </button>
          {showModal && (
            <div
              className="modal-backdrop"
              onClick={() => !submitting && setShowModal(false)}
            >
              <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
              >
                <div className="modal-header">
                  <h3 id="modal-title">Submit all tasks for {phase.title}</h3>
                  <button
                    className="modal-close"
                    onClick={() => !submitting && setShowModal(false)}
                    aria-label="Close modal"
                    disabled={submitting}
                  >
                    ×
                  </button>
                </div>
                <p className="modal-hint">
                  Add notes or upload a PDF document to submit all tasks in this phase.
                </p>
                <textarea
                  placeholder="Add notes, links, or context about your submission..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={submitting}
                  aria-label="Submission notes"
                />
                <label className="upload">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    disabled={submitting}
                    aria-label="Upload PDF file"
                  />
                  <span className="upload-text">
                    {fileName || '📄 Upload PDF Document'}
                  </span>
                  {fileName && (
                    <button
                      className="remove-file"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                        setFileName('');
                      }}
                      aria-label="Remove file"
                    >
                      ×
                    </button>
                  )}
                </label>
                {file && (
                  <div className="file-info">
                    <span className="file-name">✓ {fileName}</span>
                  </div>
                )}
                <div className="modal-actions">
                  <button
                    className="ghost"
                    onClick={() => !submitting && setShowModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="cta"
                    onClick={handleSubmit}
                    disabled={submitting || (!notes.trim() && !file)}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner"></span>
                        Sending...
                      </>
                    ) : (
                      'Send to Admin'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TopNav = ({ projectName, progress }) => {
  const [showTip, setShowTip] = useState(false);

  const getProgressStatus = () => {
    if (progress === 100) return 'Complete';
    if (progress >= 75) return 'Almost There';
    if (progress >= 50) return 'On Track';
    if (progress >= 25) return 'In Progress';
    return 'Getting Started';
  };

  return (
    <header className="top-nav">
      <div className="project">
        <div className="pill">Ongoing</div>
        <span className="project-name">{projectName}</span>
      </div>

      <div className="progress-wrap">
        <div className="progress-label">
          <span>Overall Progress</span>
          <div
            className="info"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            onClick={() => setShowTip((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowTip((v) => !v);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Progress information"
          >
            <span aria-hidden="true">i</span>
            <div className={`tooltip ${showTip ? 'show' : ''}`} role="tooltip">
              <p><strong>How progress is calculated:</strong></p>
              <p>Combined completion across all visible phases.</p>
              <p>Each task uses a 1–5 scale (5 = complete).</p>
              <p>Progress = (Sum of all task levels) ÷ (Total possible points) × 100</p>
            </div>
          </div>
        </div>
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`Overall progress: ${progress}%`}
            />
          </div>
          <div className="progress-info">
            <span className="progress-value">{progress}%</span>
            <span className="progress-status">{getProgressStatus()}</span>
          </div>
        </div>
      </div>

      <button
        className="cta contact"
        onClick={() => (window.location.href = '/admin-chat')}
        aria-label="Contact admin for support"
      >
        💬 Contact Admin
      </button>
    </header>
  );
};

const filterByEnrollment = (phases, enrollmentMap) => {
  if (!phases || !Array.isArray(phases)) return [];
  return phases.filter((phase, idx) => enrollmentMap && enrollmentMap[idx + 1]);
};

const computeProgress = (visiblePhases) => {
  if (!visiblePhases || !Array.isArray(visiblePhases)) return 0;
  const allTasks = visiblePhases.flatMap((p) => (p && p.tasks ? p.tasks : []));
  if (!allTasks.length) return 0;
  const sum = allTasks.reduce((acc, t) => acc + (t && typeof t.level === 'number' ? t.level : 0), 0);
  const max = allTasks.length * 5;
  return max > 0 ? Math.round((sum / max) * 100) : 0;
};

const ProjectCompletionRoadmap = () => {
  const [phases, setPhases] = useState(phasesData);
  const [enrollment, setEnrollment] = useState({ 1: true, 2: true, 3: true });
  const [toast, setToast] = useState(null);

  const visiblePhases = useMemo(
    () => filterByEnrollment(phases, enrollment),
    [phases, enrollment]
  );

  const progress = useMemo(
    () => computeProgress(visiblePhases),
    [visiblePhases]
  );

  const updateTaskLevel = useCallback((phaseId, taskId, newLevel) => {
    if (!phaseId || !taskId || typeof newLevel !== 'number' || newLevel < 0 || newLevel > 5) {
      return;
    }
    setPhases((prevPhases) => {
      if (!prevPhases || !Array.isArray(prevPhases)) return prevPhases;
      return prevPhases.map((phase) => {
        if (phase && phase.id === phaseId && phase.tasks) {
          return {
            ...phase,
            tasks: phase.tasks.map((task) =>
              task && task.id === taskId ? { ...task, level: Math.max(0, Math.min(5, newLevel)) } : task
            ),
          };
        }
        return phase;
      });
    });
  }, []);

  const handleSuccess = (message) => {
    setToast({ message, type: 'success' });
  };

  const handleError = (message) => {
    setToast({ message, type: 'error' });
  };

  return (
    <div className="page">
      <TopNav projectName="Project Atlas" progress={progress} />

      <main className="content">
        <div className="headline">
          <div>
            <p className="eyebrow">Project Completion Roadmap</p>
            <h1>
              Track your phases, understand progress, submit in one smooth flow.
            </h1>
            <p className="lede">
              Focused on clarity. Built for confident delivery. Every phase, task,
              and submission is mapped for you with a luxurious black-and-gold
              experience.
            </p>
          </div>
          <div className="enrollment">
            <p className="enrollment-title">Select Phases to View</p>
            <p className="enrollment-hint">Toggle phases you're enrolled in to see your tasks</p>
            {[1, 2, 3].map((num) => {
              const phase = phases && phases[num - 1];
              if (!phase) return null;
              return (
                <label key={num} className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!enrollment[num]}
                    onChange={(e) =>
                      setEnrollment((prev) => ({ ...prev, [num]: e.target.checked }))
                    }
                    aria-label={`${phase.title || 'Phase'}: ${phase.description || ''}`}
                  />
                  <div className="checkbox-content">
                    <span className="checkbox-label">
                      {phase.title || `Phase ${num}`}: {phase.description || ''}
                    </span>
                    <span className="checkbox-count">
                      {phase.tasks ? phase.tasks.length : 0} tasks
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {visiblePhases.length === 0 ? (
          <div className="empty-phases">
            <div className="empty-icon">📋</div>
            <h2>No phases selected</h2>
            <p>Select at least one phase above to view your tasks and track progress.</p>
          </div>
        ) : (
          <div className="phases-grid">
            {visiblePhases.map((phase, idx) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                defaultOpen={true}
                onSuccess={handleSuccess}
                onError={handleError}
                onUpdateTaskLevel={updateTaskLevel}
              />
            ))}
          </div>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProjectCompletionRoadmap;

