/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import SoftAvatar from "components/SoftAvatar";
import SoftBadge from "components/SoftBadge";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Table from "examples/Tables/Table";
import api from "../../assets/baseURL/api";
import Swal from "sweetalert2";
import moment from "moment";
import Pagination from "@mui/material/Pagination";

// Initial Data
const initialAuthorsTableData = {
  columns: [
    { name: "Item name", align: "left" },
    { name: "Item description", align: "left" },
    { name: "Item image", align: "left" },
    { name: "status", align: "center" },
    { name: "Posted on", align: "center" },
    { name: "action", align: "center" },
  ],
  rows: [],
};

function ItemsManagementTable(props) {
  const { isLoggedIn, userData, userToken, refreshParentLogout } = props;
  const [authorsTableData, setAuthorsTableData] = useState(initialAuthorsTableData);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // Track total number of items

  const rowsPerPage = 10;  // Number of items per page

  const loadProducts = useCallback(
    async (page = 1) => {
      try {
        const res = await api.get(`items?status=1&page=${page}&per_page=${rowsPerPage}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (res.status === 200) {
          const data = res.data.data.data;
          const newRows = data.map((item) => ({
            "Item name": (
              <SoftTypography variant="caption" color="secondary" fontWeight="small">
                {item.item_name}
              </SoftTypography>
            ),
            "Item description": (
              <SoftTypography variant="caption" color="secondary" fontWeight="small">
                {item.item_description}
              </SoftTypography>
            ),
            "Item image": (
              <SoftBox mr={2}>
                <SoftAvatar
                  src={item.default_image?.image_url || item.item_image?.[0] || "default.jpg"}
                  alt={item.item_name}
                  size="md"
                  variant="rounded"
                />
              </SoftBox>
            ),
            status: (
              <SoftBadge
                variant="gradient"
                badgeContent={item.status_name}
                color={
                  item.status === 0
                    ? "secondary"
                    : item.status === 1
                    ? "success"
                    : "error"
                }
                size="xs"
                container
              />
            ),
            "Posted on": (
              <SoftTypography variant="caption" color="secondary" fontWeight="medium">
                {dateFormatter(item.created_at)}
              </SoftTypography>
            ),
            action: (
              <SoftBox display="flex" flexDirection="column">
                <SoftButton
                  component="button"
                  variant="contained"
                  color="primary"
                  fontWeight="small"
                  sx={{ mb: 1 }}
                  onClick={() => handleApprove(item.uuid)}
                >
                  Edit
                </SoftButton>
                <SoftButton
                  component="button"
                  variant="contained"
                  color="primary"
                  fontWeight="small"
                  sx={{ mb: 1 }}
                  onClick={() => handleArchive(item.uuid)}
                >
                  Archive
                </SoftButton>
              </SoftBox>
            ),
          }));

          setAuthorsTableData((prevState) => ({
            ...prevState,
            rows: newRows,
          }));

          // Set total items and total pages for pagination
          setTotalItems(res.data.data.total);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [userToken]
  );

  useEffect(() => {
    loadProducts(currentPage);
  }, [loadProducts, currentPage]);


  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const dateFormatter = (dateToFormat) => {
    return moment(dateToFormat).format("YYYY/MM/DD, h:mm a");
  };

  const handleApprove = async (itemId) => {
    try {
      const res = await api.patch(`items/${itemId}?status=1`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (res.status === 200) {
        loadProducts(currentPage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleArchive = async (itemUuid) => {
    Swal.fire({
      title: "Wait!",
      text: "Are you sure you want to archive this item?",
      icon: "warning",
      confirmButtonText: "Yes",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`items/${itemUuid}`, {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          });
          if (res.status === 200) {
            loadProducts(currentPage);
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
  };

  const { columns, rows } = authorsTableData;
  const totalPages = Math.ceil(totalItems / rowsPerPage); // Calculate total pages based on totalItems

  return (
    <DashboardLayout>
      <DashboardNavbar refreshParentLogout={refreshParentLogout} />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Card>
            <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <SoftTypography variant="h6">Manage items</SoftTypography>
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
            <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={2}>
                <SoftButton
                  component="button"
                  variant="contained"
                  color="primary"
                  fontWeight="small"
                  onClick={handlePreviousPage} 
                  disabled={currentPage === 1}
                >
                  Previous
                </SoftButton>
                <SoftTypography variant="caption">Page {currentPage} of {totalPages}</SoftTypography>
                <SoftButton 
                    component="button"
                    variant="contained"
                    color="primary"
                    fontWeight="small"
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPages}
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

export default ItemsManagementTable;
