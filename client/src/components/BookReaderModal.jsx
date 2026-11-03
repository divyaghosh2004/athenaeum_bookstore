import React, { useState, useEffect } from 'react';
import { X, Bookmark, Type, Sun, Moon, Coffee, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function BookReaderModal({
  book,
  isOpen,
  onClose,
  initialProgress = 0,
  initialPosition = 'Chapter 1',
  onSaveProgress
}) {
  if (!isOpen || !book) return null;

  const [progress, setProgress] = useState(initialProgress);
  const [position, setPosition] = useState(initialPosition);
  const [theme, setTheme] = useState('sepia'); // 'light', 'sepia', 'dark'
  const [fontSize, setFontSize] = useState(18); // 16, 18, 20, 22
  const [fontFamily, setFontFamily] = useState('serif'); // 'serif', 'sans'
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setProgress(initialProgress);
    setPosition(initialPosition);
  }, [initialProgress, initialPosition, book]);

  // Color schemes for reader
  const themeStyles = {
    light: {
      bg: '#FFFFFF',
      text: '#1C1917',
      sidebar: '#F8FAFC',
      border: '#E2E8F0'
    },
    sepia: {
      bg: '#FAF4EB',
      text: '#382D21',
      sidebar: '#F3E9D9',
      border: '#E5D7C0'
    },
    dark: {
      bg: '#18181B',
      text: '#E4E4E7',
      sidebar: '#27272A',
      border: '#3F3F46'
    }
  };

  const currentTheme = themeStyles[theme];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSaveProgress) {
        await onSaveProgress(book._id || book.id, progress, position);
      }
      toast.success(`Progress saved: ${progress}% (${position})`);
    } catch (err) {
      toast.error('Failed to save progress.');
    } finally {
      setIsSaving(false);
    }
  };

  // Chapter content generator or book sample content
  const chapters = [
    { title: 'Chapter 1: The Beginning', text: book.sampleContent || 'The journey of a thousand pages begins with a single line of contemplative inquiry.' },
    { title: 'Chapter 2: The Crossroads', text: 'As dawn broke across the eastern horizon, long shadows danced across the ancient limestone paths. Choices made in moments of silence echo through decades of human experience.' },
    { title: 'Chapter 3: Illumination & Mastery', text: 'Understanding does not arrive with thunder; it seeps in quietly through sustained reflection, meticulous discipline, and relentless curiosity.' },
    { title: 'Chapter 4: The Open Horizon', text: 'With every step toward genuine wisdom, the world expands. The reader discovers that the ultimate reward of literature is empathy and elevated perspective.' }
  ];

  const currentChapterIndex = chapters.findIndex(c => c.title === position) >= 0
    ? chapters.findIndex(c => c.title === position)
    : 0;

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const nextPos = chapters[currentChapterIndex + 1].title;
      const nextProg = Math.round(((currentChapterIndex + 2) / chapters.length) * 100);
      setPosition(nextPos);
      setProgress(nextProg);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevPos = chapters[currentChapterIndex - 1].title;
      const prevProg = Math.round((currentChapterIndex / chapters.length) * 100);
      setPosition(prevPos);
      setProgress(prevProg);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ padding: '10px' }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1020px',
          height: '92vh',
          backgroundColor: currentTheme.bg,
          color: currentTheme.text,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'background-color 0.3s ease, color 0.3s ease'
        }}
      >
        {/* Top Header / Control Toolbar */}
        <div style={{
          padding: '14px 24px',
          borderBottom: `1px solid ${currentTheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: currentTheme.sidebar
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>
              {book.title}
            </h3>
            <p style={{ fontSize: '12px', opacity: 0.75 }}>
              By {book.author} • {position} ({progress}% completed)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Font family */}
            <div style={{ display: 'flex', border: `1px solid ${currentTheme.border}`, borderRadius: '6px', overflow: 'hidden' }}>
              <button
                onClick={() => setFontFamily('serif')}
                style={{
                  padding: '6px 10px',
                  background: fontFamily === 'serif' ? 'var(--accent-burgundy)' : 'transparent',
                  color: fontFamily === 'serif' ? '#FFF' : 'inherit',
                  border: 'none',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'serif'
                }}
              >
                Serif
              </button>
              <button
                onClick={() => setFontFamily('sans')}
                style={{
                  padding: '6px 10px',
                  background: fontFamily === 'sans' ? 'var(--accent-burgundy)' : 'transparent',
                  color: fontFamily === 'sans' ? '#FFF' : 'inherit',
                  border: 'none',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'sans-serif'
                }}
              >
                Sans
              </button>
            </div>

            {/* Font size */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setFontSize(s => Math.max(14, s - 2))}
                style={{
                  padding: '6px 8px',
                  border: `1px solid ${currentTheme.border}`,
                  background: 'transparent',
                  color: 'inherit',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                A-
              </button>
              <span style={{ fontSize: '12px', minWidth: '24px', textAlign: 'center' }}>{fontSize}</span>
              <button
                onClick={() => setFontSize(s => Math.min(26, s + 2))}
                style={{
                  padding: '6px 8px',
                  border: `1px solid ${currentTheme.border}`,
                  background: 'transparent',
                  color: 'inherit',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                A+
              </button>
            </div>

            {/* Themes */}
            <div style={{ display: 'flex', border: `1px solid ${currentTheme.border}`, borderRadius: '6px', overflow: 'hidden' }}>
              <button
                onClick={() => setTheme('light')}
                title="Day Light Theme"
                style={{
                  padding: '6px 10px',
                  background: theme === 'light' ? 'var(--accent-burgundy)' : 'transparent',
                  color: theme === 'light' ? '#FFF' : 'inherit',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Sun size={15} />
              </button>
              <button
                onClick={() => setTheme('sepia')}
                title="Sepia Paper Theme"
                style={{
                  padding: '6px 10px',
                  background: theme === 'sepia' ? 'var(--accent-burgundy)' : 'transparent',
                  color: theme === 'sepia' ? '#FFF' : 'inherit',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Coffee size={15} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                title="Night Dark Theme"
                style={{
                  padding: '6px 10px',
                  background: theme === 'dark' ? 'var(--accent-burgundy)' : 'transparent',
                  color: theme === 'dark' ? '#FFF' : 'inherit',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Moon size={15} />
              </button>
            </div>

            {/* Save progress button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '13px' }}
            >
              <Bookmark size={15} />
              <span>{isSaving ? 'Saving...' : 'Save Progress'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress bar line */}
        <div style={{ height: '3px', width: '100%', backgroundColor: currentTheme.border }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: 'var(--accent-burgundy)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* Reader Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '48px 24px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <article style={{
            maxWidth: '720px',
            width: '100%',
            fontFamily: fontFamily === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)',
            fontSize: `${fontSize}px`,
            lineHeight: '1.85'
          }}>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: `${fontSize * 1.6}px`,
              marginBottom: '32px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${currentTheme.border}`,
              textAlign: 'center'
            }}>
              {chapters[currentChapterIndex].title}
            </h1>

            <div style={{ whiteSpace: 'pre-line', marginBottom: '40px' }}>
              {chapters[currentChapterIndex].text}
            </div>

            <p style={{ marginTop: '24px', fontStyle: 'italic', opacity: 0.85 }}>
              "Reading maketh a full man; conference a ready man; and writing an exact man." — Francis Bacon
            </p>
          </article>
        </div>

        {/* Footer Navigation */}
        <div style={{
          padding: '14px 24px',
          borderTop: `1px solid ${currentTheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: currentTheme.sidebar
        }}>
          <button
            onClick={handlePrevChapter}
            disabled={currentChapterIndex === 0}
            className="btn btn-secondary"
            style={{ fontSize: '13px' }}
          >
            <ChevronLeft size={16} /> Previous Chapter
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px' }}>Progress: {progress}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              style={{ width: '120px', accentColor: 'var(--accent-burgundy)' }}
            />
          </div>

          <button
            onClick={handleNextChapter}
            disabled={currentChapterIndex >= chapters.length - 1}
            className="btn btn-secondary"
            style={{ fontSize: '13px' }}
          >
            Next Chapter <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

