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
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
};

const PhaseCard = ({ phase, defaultOpen = false, onSuccess, onUpdateTaskLevel }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const taskCount = phase.tasks.length;
  const completedTasks = phase.tasks.filter((t) => t.level === 5).length;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setFileName(selectedFile.name);
      } else {
        alert('Please upload a PDF file only.');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!notes.trim() && !file) {
      alert('Please add notes or upload a PDF file before submitting.');
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
  }, [notes, file, phase.title, onSuccess]);

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
        {phase.tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks available for this phase.</p>
          </div>
        ) : (
          <div className="tasks">
            {phase.tasks.map((task, idx) => (
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
            ))}
          </div>
        )}

        <div className="submit-all">
          <button
            className="cta"
            onClick={() => setShowModal(true)}
            disabled={phase.tasks.length === 0}
            aria-label={`Submit all tasks for ${phase.title}`}
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
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={submitting}
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

const filterByEnrollment = (phases, enrollmentMap) =>
  phases.filter((phase, idx) => enrollmentMap[idx + 1]);

const computeProgress = (visiblePhases) => {
  const allTasks = visiblePhases.flatMap((p) => p.tasks);
  if (!allTasks.length) return 0;
  const sum = allTasks.reduce((acc, t) => acc + t.level, 0);
  const max = allTasks.length * 5;
  return Math.round((sum / max) * 100);
};

const ProjectCompletionRoadmap = () => {
  const [phases, setPhases] = useState(phasesData);
  const [enrollment, setEnrollment] = useState({ 1: true, 2: true, 3: false });
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
    setPhases((prevPhases) =>
      prevPhases.map((phase) => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            tasks: phase.tasks.map((task) =>
              task.id === taskId ? { ...task, level: newLevel } : task
            ),
          };
        }
        return phase;
      })
    );
  }, []);

  const handleSuccess = (message) => {
    setToast({ message, type: 'success' });
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
              const phase = phases[num - 1];
              return (
                <label key={num} className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!enrollment[num]}
                    onChange={(e) =>
                      setEnrollment((prev) => ({ ...prev, [num]: e.target.checked }))
                    }
                    aria-label={`${phase.title}: ${phase.description}`}
                  />
                  <div className="checkbox-content">
                    <span className="checkbox-label">
                      {phase.title}: {phase.description}
                    </span>
                    <span className="checkbox-count">
                      {phase.tasks.length} tasks
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
                defaultOpen={idx === 0}
                onSuccess={handleSuccess}
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

