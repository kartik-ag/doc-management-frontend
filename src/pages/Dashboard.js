import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Upload as UploadIcon,
  QuestionAnswer as QuestionAnswerIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  fetchDocumentsStart,
  fetchDocumentsSuccess,
  fetchDocumentsFailure,
  deleteDocumentStart,
  deleteDocumentSuccess,
  deleteDocumentFailure,
  uploadDocumentStart,
  uploadDocumentSuccess,
  uploadDocumentFailure,
} from '../store/slices/documentSlice';
import { documentsAPI, aiAPI } from '../services/api';
import { logout } from '../store/slices/authSlice';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';

const Dashboard = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { documents, loading, error: reduxError } = useSelector((state) => state.documents);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    dispatch(fetchDocumentsStart());
    try {
      const response = await documentsAPI.getDocuments();
      dispatch(fetchDocumentsSuccess(response.data));
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch documents';
      dispatch(fetchDocumentsFailure(errorMessage));
      setError(errorMessage);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentTitle) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', documentTitle);

    dispatch(uploadDocumentStart());
    try {
      const response = await documentsAPI.uploadDocument(formData);
      dispatch(uploadDocumentSuccess(response.data));
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDocumentTitle('');
    } catch (error) {
      const errorMessage = error.message || 'Upload failed';
      dispatch(uploadDocumentFailure(errorMessage));
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    dispatch(deleteDocumentStart());
    try {
      await documentsAPI.deleteDocument(id);
      dispatch(deleteDocumentSuccess(id));
    } catch (error) {
      const errorMessage = error.message || 'Delete failed';
      dispatch(deleteDocumentFailure(errorMessage));
      setError(errorMessage);
    }
  };

  const handleAskQuestion = async () => {
    if (!question || !selectedDocument) return;

    try {
      const response = await aiAPI.askQuestion(selectedDocument.id, question);
      setAnswer(response.data.answer);
    } catch (error) {
      const errorMessage = error.message || 'Failed to get answer';
      setAnswer(`Error: ${errorMessage}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700}>
            Your Documents
          </Typography>
          <Tooltip title="Upload Document">
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Upload Document
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            {documents.length === 0 ? (
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <InsertDriveFileIcon sx={{ fontSize: 48, mb: 1, color: 'primary.main' }} />
                  <Typography variant="h6">No documents uploaded yet.</Typography>
                </Paper>
              </Grid>
            ) : (
              documents.map((doc) => (
                <Grid item xs={12} sm={6} md={4} key={doc.id}>
                  <Paper elevation={4} sx={{ p: 3, borderRadius: 3, position: 'relative', minHeight: 180 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <InsertDriveFileIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight={600} noWrap>
                        {doc.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Uploaded: {new Date(doc.created_at).toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, position: 'absolute', bottom: 16, right: 16 }}>
                      <Tooltip title="Ask a Question">
                        <IconButton color="primary" onClick={() => {
                          setSelectedDocument(doc);
                          setQuestionDialogOpen(true);
                        }}>
                          <QuestionAnswerIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Document">
                        <IconButton color="error" onClick={() => handleDelete(doc.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CloudUploadIcon color="primary" /> Upload Document
          </Box>
          <IconButton onClick={() => setUploadDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Document Title"
            name="title"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2, mb: 1 }}
            startIcon={<AddCircleOutlineIcon />}
          >
            Choose File
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {selectedFile && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Selected: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" disabled={!selectedFile || !documentTitle}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Question Dialog */}
      <Dialog
        open={questionDialogOpen}
        onClose={() => {
          setQuestionDialogOpen(false);
          setQuestion('');
          setAnswer('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <QuestionAnswerIcon color="primary" /> Ask a Question
          </Box>
          <IconButton onClick={() => setQuestionDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Your Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          {answer && (
            <Paper elevation={2} sx={{ p: 2, mt: 2, background: '#f5f5f5' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Answer:
              </Typography>
              <Typography variant="body1">{answer}</Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialogOpen(false)}>Close</Button>
          <Button onClick={handleAskQuestion} variant="contained" disabled={!question}>
            Ask
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 