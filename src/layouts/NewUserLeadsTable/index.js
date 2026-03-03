import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Pagination,
  Typography,
  Box,
} from "@mui/material";

export default function UserLeadsTable() {
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchLeads = async (pageNumber = 1) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `https://api.therelovedmarketplace.com/api/user-leads?page=${pageNumber}`
      );

      setLeads(res.data.data);
      setTotalPages(res.data.last_page);
      setPage(res.data.current_page);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(page);
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>
        User Leads
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {leads.map((lead, index) => (
              <TableRow key={index}>
                <TableCell>{lead.first_name}</TableCell>
                <TableCell>{lead.last_name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>
                  {new Date(lead.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3} display="flex" justifyContent="center">
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
}