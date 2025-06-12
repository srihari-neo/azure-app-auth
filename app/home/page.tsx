'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUploadComponent from './FileUpload';

interface FileItem {
  name: string;
  url: string;
  size?: number;
  lastModified?: Date;
}

export default function HomePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const email = localStorage.getItem('userEmail');
    console.log("Is logged in: ", isLoggedIn);

    if (!isLoggedIn) {
      router.push('/');
    } else {
      setUserEmail(email || '');
      loadFiles();
    }
  }, [router]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/storage');
      console.log('Loading files from API:', response);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  const handleFileUpload = () => {
    setShowUploadModal(false);
    loadFiles(); // Refresh the file list
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;
    
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(fileName)}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadFiles(); // Refresh the file list
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #0f172a, #2e1065, #0f172a)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', top: '25%', left: '25%', width: '384px', height: '384px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', filter: 'blur(96px)', animation: 'pulse 4s infinite' }}></div>
        <div style={{ position: 'absolute', top: '75%', right: '25%', width: '320px', height: '320px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', filter: 'blur(96px)', animation: 'pulse 4s infinite 1s' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '256px', height: '256px', background: 'rgba(244, 114, 182, 0.1)', borderRadius: '50%', filter: 'blur(96px)', animation: 'pulse 4s infinite 0.5s' }}></div>
      </div>

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 10, padding: '24px' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(to right, #3b82f6, #9333ea)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>A</span>
            </div>
            <span style={{ color: '#fff', fontWeight: '600', fontSize: '18px' }}>File Manager</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="current-time">
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>{currentTime}</div>
            </div>
            {userEmail && (
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                <span style={{ color: '#93c5fd' }}>{userEmail}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            >
              <svg
                style={{ width: '16px', height: '16px', fill: 'none', stroke: 'currentColor' }}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 10, flex: 1, padding: '24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Files Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
                Your Files
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }}>
                Manage and organize your uploaded files
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              <svg
                style={{ width: '20px', height: '20px', fill: 'none', stroke: 'currentColor' }}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upload File
            </button>
          </div>

          {/* Files List */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {isLoading ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(255, 255, 255, 0.3)', borderRadius: '50%', borderTopColor: '#3b82f6', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '16px' }}>Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <svg
                  style={{ width: '64px', height: '64px', color: 'rgba(255, 255, 255, 0.3)', margin: '0 auto 16px' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px', marginBottom: '8px' }}>No files uploaded yet</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>Click the &quot;Upload File&quot; button to get started</p>
              </div>
            ) : (
              <div>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: '16px',
                  padding: '16px 24px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <div>Name</div>
                  <div>Size</div>
                  <div>Modified</div>
                  <div>Actions</div>
                </div>

                {/* Table Body */}
                {files.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto auto',
                      gap: '16px',
                      padding: '16px 24px',
                      borderBottom: index < files.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg
                        style={{ width: '20px', height: '20px', color: '#3b82f6', flexShrink: 0 }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span style={{ color: '#fff', fontSize: '16px', wordBreak: 'break-all' }}>{file.name}</span>
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', textAlign: 'right' }}>
                      {formatFileSize(file.size)}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', textAlign: 'right' }}>
                      {formatDate(file.lastModified)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '6px',
                          color: '#60a5fa',
                          fontSize: '12px',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Download
                      </a>
                      <button
                        onClick={() => handleDeleteFile(file.name)}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          color: '#f87171',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUploadModal(false);
            }
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>Upload File</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <svg
                  style={{ width: '20px', height: '20px' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <FileUploadComponent onUploadSuccess={handleFileUpload} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, padding: '24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px' }}>
            © 2025 Your App. Made with ❤️
          </p>
        </div>
      </footer>

      {/* CSS for Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .current-time {
          display: none;
        }
        @media (min-width: 640px) {
          .current-time {
            display: block;
          }
        }
        .logout-text {
          display: none;
        }
        @media (min-width: 640px) {
          .logout-text {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}