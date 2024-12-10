import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Box,
} from "@mui/material";
import {
  BusinessCenter,
  School,
  AttachMoney,
  DateRange,
  WorkOutline,
} from "@mui/icons-material";
import Sidebar from "./Sidebar";

function UpcomingCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingCompanies();
  }, []);

  const fetchUpcomingCompanies = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/companies/");
      setCompanies(response.data.companies);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch companies", error);
      setIsLoading(false);
    }
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedCompany(null);
    setIsDetailsModalOpen(false);
  };

  return (
    <div className="flex bg-gray-50">
      <div className="w-64 h-screen bg-white shadow-lg">
        <Sidebar />
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <Typography
            variant="h4"
            className="mb-8 font-bold text-gray-800 text-center"
          >
            Upcoming Campus Recruitment Drives
          </Typography>

          {isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="50vh"
              className="bg-white rounded-lg shadow-sm"
            >
              <Typography variant="h6" className="text-gray-600">
                Loading companies...
              </Typography>
            </Box>
          ) : companies.length === 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="50vh"
              className="bg-white rounded-lg shadow-sm"
            >
              <Typography variant="h6" className="text-gray-500">
                No upcoming recruitment drives at the moment
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {companies.map((company, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card className="hover:shadow-xl transition-shadow duration-300 rounded-lg">
                    <CardHeader
                      title={
                        <Typography
                          variant="h6"
                          className="text-gray-800 font-semibold"
                        >
                          {company.name}
                        </Typography>
                      }
                      subheader={
                        <Typography
                          variant="subtitle2"
                          className="text-gray-600"
                        >
                          {company.industry}
                        </Typography>
                      }
                      avatar={
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <img
                            src={company.logo || "/api/placeholder/64/64"}
                            alt={`${company.name} logo`}
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                      }
                      className="border-b"
                    />
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-700">
                          <DateRange className="text-blue-600" />
                          <Typography variant="body2">
                            {company.recruitmentDate}
                          </Typography>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <AttachMoney className="text-green-600" />
                          <Typography variant="body2">
                            CTC: {company.ctc}
                          </Typography>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <WorkOutline className="text-purple-600" />
                          <Typography variant="body2">
                            {company.roles.join(", ")}
                          </Typography>
                        </div>
                      </div>
                      <Divider className="my-4" />
                      <div className="flex justify-between items-center pt-2">
                        <Chip
                          label={company.status}
                          color={
                            company.status === "Open"
                              ? "success"
                              : company.status === "Upcoming"
                              ? "warning"
                              : "default"
                          }
                          className="font-medium"
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleViewDetails(company)}
                          className="px-4 py-2 rounded-lg"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Dialog
            open={isDetailsModalOpen}
            onClose={handleCloseDetailsModal}
            maxWidth="md"
            fullWidth
            PaperProps={{
              className: "rounded-lg",
            }}
          >
            {selectedCompany && (
              <>
                <DialogTitle className="bg-gray-50 border-b">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <img
                        src={selectedCompany.logo || "/api/placeholder/64/64"}
                        alt={`${selectedCompany.name} logo`}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <div>
                      <Typography
                        variant="h5"
                        className="text-gray-800 font-semibold"
                      >
                        {selectedCompany.name}
                      </Typography>
                      <Typography variant="subtitle1" className="text-gray-600">
                        {selectedCompany.industry}
                      </Typography>
                    </div>
                  </div>
                </DialogTitle>
                <DialogContent className="mt-4">
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        className="text-gray-800 font-semibold"
                      >
                        Eligibility Criteria
                      </Typography>
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <School className="text-blue-600" />
                          <Typography variant="body2" className="text-gray-700">
                            Min. Academic Score:{" "}
                            {selectedCompany.eligibility.minScore}%
                          </Typography>
                        </div>
                        <div className="flex items-center gap-3">
                          <BusinessCenter className="text-purple-600" />
                          <Typography variant="body2" className="text-gray-700">
                            Backlogs Allowed:{" "}
                            {selectedCompany.eligibility.backlogsAllowed}
                          </Typography>
                        </div>
                      </div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        className="text-gray-800 font-semibold"
                      >
                        Job Details
                      </Typography>
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <Typography variant="body2" className="text-gray-700">
                          <strong>Recruitment Date:</strong>{" "}
                          {selectedCompany.recruitmentDate}
                        </Typography>
                        <Typography variant="body2" className="text-gray-700">
                          <strong>CTC:</strong> {selectedCompany.ctc}
                        </Typography>
                        <Typography variant="body2" className="text-gray-700">
                          <strong>Roles:</strong>{" "}
                          {selectedCompany.roles.join(", ")}
                        </Typography>
                      </div>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider className="my-4" />
                      <Typography
                        variant="h6"
                        gutterBottom
                        className="text-gray-800 font-semibold"
                      >
                        Additional Information
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-gray-700 bg-gray-50 p-4 rounded-lg"
                      >
                        {selectedCompany.additionalInfo ||
                          "No additional information available."}
                      </Typography>
                    </Grid>
                  </Grid>
                </DialogContent>
              </>
            )}
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default UpcomingCompaniesPage;
