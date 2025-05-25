import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  documents: [],
  loading: false,
  error: null,
  selectedDocument: null,
};

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    fetchDocumentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDocumentsSuccess: (state, action) => {
      state.loading = false;
      state.documents = action.payload;
    },
    fetchDocumentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    uploadDocumentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    uploadDocumentSuccess: (state, action) => {
      state.loading = false;
      state.documents.unshift(action.payload);
    },
    uploadDocumentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteDocumentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteDocumentSuccess: (state, action) => {
      state.loading = false;
      state.documents = state.documents.filter(doc => doc.id !== action.payload);
    },
    deleteDocumentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectDocument: (state, action) => {
      state.selectedDocument = action.payload;
    },
    clearSelectedDocument: (state) => {
      state.selectedDocument = null;
    },
  },
});

export const {
  fetchDocumentsStart,
  fetchDocumentsSuccess,
  fetchDocumentsFailure,
  uploadDocumentStart,
  uploadDocumentSuccess,
  uploadDocumentFailure,
  deleteDocumentStart,
  deleteDocumentSuccess,
  deleteDocumentFailure,
  selectDocument,
  clearSelectedDocument,
} = documentSlice.actions;

export default documentSlice.reducer; 