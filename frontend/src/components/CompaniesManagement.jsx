import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from "@mui/material";
import { Upload, Trash2, Edit, Building2, Plus } from "lucide-react";

const CompaniesManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [newRole, setNewRole] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    logo: "",
    recruitmentDate: "",
    ctc: "",
    roles: [],
    status: "Active",
    eligibility: {
      minScore: 0,
      backlogsAllowed: 0,
    },
    additionalInfo: "",
  });
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      console.log("Fetching companies...");
      const response = await fetch("http://127.0.0.1:8000/companies/");
      const data = await response.json();
      if (mounted) {
        setCompanies(data.companies);
      }
    };

    fetchData();
    return () => (mounted = false);
  }, []);

  const handleSubmit = async () => {
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `http://127.0.0.1:8000/companies/${selectedCompany._id}`
        : "http://127.0.0.1:8000/add-company";

      // Ensure formData matches CompanyDetails model structure
      const submissionData = {
        ...formData,
        eligibility: {
          minScore: parseInt(formData.eligibility.minScore),
          backlogsAllowed: parseInt(formData.eligibility.backlogsAllowed),
        },
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (logoFile) {
          await handleLogoUpload(responseData.company_id, logoFile);
        }
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Failed to save company:", error);
    }
  };

  const handleLogoUpload = async (companyId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `http://127.0.0.1:8000/companies/${companyId}/logo`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        fetchCompanies();
      }
    } catch (error) {
      console.error("Failed to upload logo:", error);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/companies/${companyId}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          fetchCompanies();
        }
      } catch (error) {
        console.error("Failed to delete company:", error);
      }
    }
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry,
      recruitmentDate: company.recruitmentDate,
      ctc: company.ctc,
      roles: company.roles,
      status: company.status,
      eligibility: company.eligibility,
      additionalInfo: company.additionalInfo || "",
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setSelectedCompany(null);
    setFormData({
      name: "",
      industry: "",
      recruitmentDate: "",
      ctc: "",
      roles: [],
      status: "Active",
      eligibility: {
        minScore: 0,
        backlogsAllowed: 0,
      },
      additionalInfo: "",
    });
  };

  const handleAddRole = () => {
    if (newRole.trim()) {
      setFormData({
        ...formData,
        roles: [...formData.roles, newRole.trim()],
      });
      setNewRole("");
    }
  };

  const handleRemoveRole = (roleToRemove) => {
    setFormData({
      ...formData,
      roles: formData.roles.filter((role) => role !== roleToRemove),
    });
  };
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
    }
  };

  return (
    <Box className="p-6">
      <Card className="mb-6">
        <CardContent>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5" className="font-bold">
              Companies Management
            </Typography>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-500 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Logo</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>CTC</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company._id}>
                    <TableCell>
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <Building2 className="w-10 h-10 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.industry}</TableCell>
                    <TableCell>{company.ctc}</TableCell>
                    <TableCell>
                      <Chip
                        label={company.status}
                        className={
                          company.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => handleEditCompany(company)}>
                          <Edit className="w-4 h-4" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteCompany(company._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {isEditing ? "Edit Company" : "Add New Company"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className="mt-2">
            <Grid item xs={12} className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                id="logo-upload"
                hidden
                onChange={handleLogoChange}
              />
              <label htmlFor="logo-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<Upload />}
                >
                  Upload Logo
                </Button>
              </label>
              {logoFile && (
                <Typography variant="body2">{logoFile.name}</Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Company Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Industry"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Recruitment Date"
                type="date"
                value={formData.recruitmentDate}
                onChange={(e) =>
                  setFormData({ ...formData, recruitmentDate: e.target.value })
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="CTC"
                value={formData.ctc}
                onChange={(e) =>
                  setFormData({ ...formData, ctc: e.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Box className="flex gap-2 mb-2">
                <TextField
                  label="Add Role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  fullWidth
                />
                <Button
                  onClick={handleAddRole}
                  className="bg-blue-500 text-white"
                >
                  Add
                </Button>
              </Box>
              <Box className="flex flex-wrap gap-2">
                {formData.roles.map((role, index) => (
                  <Chip
                    key={index}
                    label={role}
                    onDelete={() => handleRemoveRole(role)}
                    className="bg-gray-100"
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Minimum Score"
                type="number"
                value={formData.eligibility.minScore}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    eligibility: {
                      ...formData.eligibility,
                      minScore: parseInt(e.target.value),
                    },
                  })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Backlogs Allowed"
                type="number"
                value={formData.eligibility.backlogsAllowed}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    eligibility: {
                      ...formData.eligibility,
                      backlogsAllowed: parseInt(e.target.value),
                    },
                  })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Additional Information"
                multiline
                rows={4}
                value={formData.additionalInfo}
                onChange={(e) =>
                  setFormData({ ...formData, additionalInfo: e.target.value })
                }
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-blue-500 text-white">
            {isEditing ? "Update" : "Add"} Company
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompaniesManagement;
