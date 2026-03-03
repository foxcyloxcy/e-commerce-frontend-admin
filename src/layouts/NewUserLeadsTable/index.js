/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Table from "examples/Tables/Table";
import api from "../../assets/baseURL/api";
import moment from "moment";

const initialTableData = {
  columns: [
    { name: "first name", align: "left" },
    { name: "last name", align: "left" },
    { name: "email", align: "left" },
    { name: "joined on", align: "center" },
  ],
  rows: [],
};

function UserLeadsManagementTable({ userToken, refreshParentLogout }) {
  const [tableData, setTableData] = useState(initialTableData);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const rowsPerPage = 10;

  const loadLeads = useCallback(
    async (page = 1) => {
      try {
        const res = await api.get(
          `user-leads?page=${page}&per_page=${rowsPerPage}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        if (res.status === 200) {
          const data = res.data.data;

          const newRows = data.map((lead) => ({
            "first name": (
              <SoftTypography variant="caption" color="secondary" fontWeight="medium">
                {lead.first_name}
              </SoftTypography>
            ),
            "last name": (
              <SoftTypography variant="caption" color="secondary" fontWeight="medium">
                {lead.last_name}
              </SoftTypography>
            ),
            email: (
              <SoftTypography variant="caption" color="secondary" fontWeight="medium">
                {lead.email}
              </SoftTypography>
            ),
            "joined on": (
              <SoftTypography variant="caption" color="secondary" fontWeight="medium">
                {moment(lead.created_at).format("YYYY/MM/DD, h:mm a")}
              </SoftTypography>
            ),
          }));

          setTableData((prev) => ({
            ...prev,
            rows: newRows,
          }));

          setTotalItems(res.data.total);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [userToken]
  );

  useEffect(() => {
    loadLeads(currentPage);
  }, [loadLeads, currentPage]);

  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const { columns, rows } = tableData;

  return (
    <DashboardLayout>
      <DashboardNavbar refreshParentLogout={refreshParentLogout} />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Card>
            <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <SoftTypography variant="h6">
                User Leads
              </SoftTypography>
            </SoftBox>

            <SoftBox
              sx={{
                "& .MuiTableRow-root:not(:last-child)": {
                  "& td": {
                    borderBottom: ({ borders: { borderWidth, borderColor } }) =>
                      `${borderWidth[1]} solid ${borderColor}`,
                  },
                },
              }}
            >
              <Table columns={columns} rows={rows} />
            </SoftBox>

            <SoftBox
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={2}
            >
              <SoftButton
                variant="contained"
                color="primary"
                fontWeight="small"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </SoftButton>

              <SoftTypography variant="caption">
                Page {currentPage} of {totalPages || 1}
              </SoftTypography>

              <SoftButton
                variant="contained"
                color="primary"
                fontWeight="small"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </SoftButton>
            </SoftBox>
          </Card>
        </SoftBox>
      </SoftBox>
    </DashboardLayout>
  );
}

export default UserLeadsManagementTable;