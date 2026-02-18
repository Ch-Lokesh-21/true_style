import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Tooltip,
  Paper,
  Chip,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import type {
  GridRowParams,
} from '@mui/x-data-grid';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useContactUsQuery, useDeleteContactUsMutation } from '../hooks/useContactUsData';
import type { ContactUs } from '../types';

// Custom Toolbar with Search
let toolbarSearchQuery = '';
let toolbarSetSearchQuery: (value: string) => void = () => {};

const CustomToolbar: React.FC = () => {
  return (
    <Box sx={{ p: 2, width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            placeholder="Search by name or email..."
            value={toolbarSearchQuery}
            onChange={(e) => toolbarSetSearchQuery(e.target.value)}
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        </Box>
      </Box>
  );
};

// View Details Dialog
interface ViewDialogProps {
  open: boolean;
  onClose: () => void;
  contact: ContactUs | null;
}

const ViewDialog: React.FC<ViewDialogProps> = ({ open, onClose, contact }) => {
  if (!contact) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon color="primary" />
          Contact Message Details
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {contact.name}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EmailIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {contact.email}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Submitted On
            </Typography>
            <Chip 
              label={format(new Date(contact.created_at), 'PPP')}
              variant="outlined"
              color="primary"
              sx={{ mb: 2 }}
            />
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Message
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {contact.message}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Delete Confirmation Dialog
interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contactName: string;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ open, onClose, onConfirm, contactName }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Confirm Deletion</DialogTitle>
    <DialogContent>
      <Alert severity="warning" sx={{ mb: 2 }}>
        This action cannot be undone.
      </Alert>
      <Typography>
        Are you sure you want to delete the contact message from <strong>{contactName}</strong>?
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="outlined">
        Cancel
      </Button>
      <Button onClick={onConfirm} variant="contained" color="error" startIcon={<DeleteIcon />}>
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

// Main Component
export const ContactUsList: React.FC = () => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Update toolbar state
  React.useEffect(() => {
    toolbarSearchQuery = searchQuery;
    toolbarSetSearchQuery = setSearchQuery;
  }, [searchQuery]);
  
  const [viewDialog, setViewDialog] = useState<{ open: boolean; contact: ContactUs | null }>({
    open: false,
    contact: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; contact: ContactUs | null }>({
    open: false,
    contact: null,
  });

  // Data fetching
  const { data: contactsData, isLoading, error } = useContactUsQuery({
    limit: paginationModel.pageSize,
    offset: paginationModel.page * paginationModel.pageSize,
  });

  // Filter data based on search query
  const filteredContacts = React.useMemo(() => {
    if (!contactsData || !searchQuery.trim()) return contactsData || [];
    
    return contactsData.filter((contact: ContactUs) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contactsData, searchQuery]);

  // Mutations
  const deleteContactMutation = useDeleteContactUsMutation();

  // Event handlers
  const handleView = (contact: ContactUs) => {
    setViewDialog({ open: true, contact });
  };

  const handleDelete = (contact: ContactUs) => {
    setDeleteDialog({ open: true, contact });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.contact) {
      deleteContactMutation.mutate(deleteDialog.contact.id, {
        onSuccess: () => {
          setDeleteDialog({ open: false, contact: null });
        },
      });
    }
  };

  // Column definitions
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, width: '100%' }}>
          <PersonIcon color="action" fontSize="small" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, width: '100%' }}>
          <EmailIcon color="action" fontSize="small" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'message',
      headerName: 'Message',
      width: 400,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Tooltip title={params.value} arrow>
          <Typography 
            variant="body2" 
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Submitted',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={format(new Date(params.value), 'MMM dd, yyyy')}
          variant="outlined"
          color="primary"
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      getActions: (params: GridRowParams<ContactUs>) => [
        <GridActionsCellItem
          key={`view-${params.row.id}`}
          icon={
            <Tooltip title="View Details">
              <ViewIcon />
            </Tooltip>
          }
          label="View"
          onClick={() => handleView(params.row)}
        />,
        <GridActionsCellItem
          key={`delete-${params.row.id}`}
          icon={
            <Tooltip title="Delete">
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDelete(params.row)}
        />,
      ],
    },
  ];

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load contact messages. Please try again later.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3, 
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600, 
              color: 'primary.main',
              textAlign: 'center',
              width: '100%'
            }}
          >
            Contact Us Messages
          </Typography>
        </Box>

        <Paper 
          elevation={1} 
          sx={{ 
            height: 600, 
            width: '100%',
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 2
          }}
        >
        <DataGrid
          rows={filteredContacts}
          columns={columns}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          slots={{
            toolbar: CustomToolbar,
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(224, 224, 224, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              borderBottom: '2px solid rgba(224, 224, 224, 1)',
              '& .MuiDataGrid-columnHeaderTitle': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              },
            },
            minHeight: 600,
          }}
          />
      </Paper>
      </Paper>
      {/* View Dialog */}
      <ViewDialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, contact: null })}
        contact={viewDialog.contact}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, contact: null })}
        onConfirm={handleDeleteConfirm}
        contactName={deleteDialog.contact?.name || ''}
      />
    </Box>
  );
};