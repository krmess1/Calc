import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout, getAccessToken } from '../lib/googleAuth';
import { listDealSheetsFromDrive, DriveFile, deleteDriveFile } from '../lib/driveService';

export const GoogleDrivePanel: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Confirmation modal state for destructive delete
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        setHasToken(!!token);
        fetchFiles();
      },
      () => {
        setUser(null);
        setHasToken(false);
        setFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);
      setError('');
      const list = await listDealSheetsFromDrive();
      setFiles(list);
    } catch (err: any) {
      console.warn('Could not fetch Drive files:', err);
      // If token expired or not authorized yet
      setError(err.message || 'Could not load files from Google Drive.');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setHasToken(true);
        setStatusMsg('Connected to Google Drive successfully!');
        setTimeout(() => setStatusMsg(''), 3500);
        fetchFiles();
      }
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setHasToken(false);
    setFiles([]);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      setDeleting(true);
      setError('');
      await deleteDriveFile(fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setStatusMsg(`Deleted "${fileToDelete.name}" from Google Drive.`);
      setTimeout(() => setStatusMsg(''), 3000);
      setFileToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete file.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="drawer" id="drive-drawer" style={{ marginTop: '24px' }}>
      <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '1.25rem' }}>📁</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#185fa5' }}>
              Google Drive Cloud Sync
            </div>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>
              Automatic folder storage: "Wholesale Deal Calculator - Tear Sheets"
            </div>
          </div>
        </div>

        <div>
          {user && hasToken ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#27500a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27500a' }} />
                Connected as {user.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  background: 'none',
                  border: '1px solid #d3d1c7',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  color: '#666',
                  cursor: 'pointer',
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="gsi-material-button"
              style={{
                background: '#ffffff',
                border: '1px solid #747775',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#1f1f1f',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              }}
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: '16px', height: '16px', display: 'block' }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              {loading ? 'Connecting...' : 'Connect Google Drive'}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '16px', background: '#faf9f5', borderTop: '1px solid #ede8de' }}>
        {statusMsg && (
          <div style={{ color: '#27500a', fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>
            ✓ {statusMsg}
          </div>
        )}
        {error && (
          <div style={{ color: '#b3261e', fontSize: '0.85rem', marginBottom: '10px' }}>
            ⚠ {error}
          </div>
        )}

        {!user || !hasToken ? (
          <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.5 }}>
            Connect your Google Drive account with your permission to back up your underwriting tear sheets, share live docs with Richard or buyers, and access your analyzed deals anywhere.
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>
                Synced Tear Sheets ({files.length})
              </span>
              <button
                type="button"
                onClick={fetchFiles}
                disabled={loadingFiles}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#185fa5',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {loadingFiles ? 'Refreshing...' : '↻ Refresh List'}
              </button>
            </div>

            {loadingFiles ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#777', fontSize: '0.85rem' }}>
                Loading files from your Google Drive...
              </div>
            ) : files.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#777', fontSize: '0.85rem', background: '#fff', borderRadius: '6px', border: '1px dashed #dcd8ce' }}>
                No tear sheets uploaded to Google Drive yet. Open the <strong>"Export Tear Sheet"</strong> modal above and click <strong>"Save to Google Drive"</strong>.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {files.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#ffffff',
                      border: '1px solid #e2ded5',
                      borderRadius: '6px',
                      padding: '8px 12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '1rem' }}>📄</span>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2c2c2a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#777' }}>
                          Updated: {new Date(file.modifiedTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.75rem',
                            color: '#185fa5',
                            textDecoration: 'none',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: '#eef4fb',
                          }}
                        >
                          Open in Drive ↗
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setFileToDelete(file)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#b3261e',
                          cursor: 'pointer',
                          fontSize: '13px',
                          padding: '3px 6px',
                        }}
                        title="Delete from Google Drive"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explicit User Confirmation Dialog for Destructive Operations */}
      {fileToDelete && (
        <div
          className="modal-back show"
          style={{ zIndex: 1100 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) setFileToDelete(null);
          }}
        >
          <div className="modal" style={{ maxWidth: '420px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#b3261e', fontSize: '1.15rem' }}>
              Confirm Delete from Google Drive
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Are you sure you want to delete <strong>"{fileToDelete.name}"</strong> from your Google Drive? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setFileToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  background: '#b3261e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {deleting ? 'Deleting...' : 'Delete File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
