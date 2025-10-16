/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import SoftAvatar from "components/SoftAvatar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";
import Pagination from "@mui/material/Pagination";
import api from "../../assets/baseURL/api";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField } from "@mui/material";
import moment from "moment";

// Initial Data
const initialAuthorsTableData = {
  columns: [
    { name: "Item name", align: "left" },
    { name: "Item description", align: "left" },
    { name: "Item image", align: "left" },
    { name: "Location", align: "left" },
    { name: "Posted on", align: "center" },
    { name: "action", align: "center" },
  ],
  rows: [],
};

function ItemsApprovalTable(props) {
  const { isLoggedIn, userData, userToken, refreshParentLogout } = props;

  const [authorsTableData, setAuthorsTableData] = useState(initialAuthorsTableData);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleParseAddress = (address) => {
    const parseAddress = JSON.parse(address);
    return parseAddress[0]?.formatted_address || "N/A";
  };

  const dateFormatter = (dateToFormat) => moment(dateToFormat).format("YYYY/MM/DD, h:mm a");

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

  const loadProducts = useCallback(
    async (page = 1) => {
      try {
        const res = await api.get(`items/status/pending?page=${page}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (res.status === 200) {
          const { data, current_page, last_page } = res.data.data;

          const newRows = data.map((item) => ({
            "Item name": (
              <SoftTypography variant="caption" color="secondary" fontWeight="small">
                {item.item_name}
              </SoftTypography>
            ),
            "Item description": (
              <SoftTypography
                variant="caption"
                color="secondary"
                fontWeight="small"
                style={{
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                  width: "50px",
                }}
              >
                {item.item_description}
              </SoftTypography>
            ),
            "Item image": (
              <SoftBox mr={2}>
                <SoftAvatar
                  src={item.default_image ? item.default_image.image_url : item.item_image[0]}
                  alt={item.item_name}
                  size="sm"
                  variant="rounded"
                  bgColor="transparent"
                />
              </SoftBox>
            ),
            Location: (
              <SoftTypography variant="caption" color="secondary" fontWeight="small">
                {handleParseAddress(item.address)}
              </SoftTypography>
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
                  Approve
                </SoftButton>
                <SoftButton
                  component="button"
                  variant="contained"
                  color="primary"
                  fontWeight="small"
                  sx={{ mb: 1 }}
                  onClick={() => handleOpenRejectDialog(item.uuid)}
                >
                  Reject
                </SoftButton>
              </SoftBox>
            ),
          }));

          setAuthorsTableData((prevState) => ({
            ...prevState,
            rows: newRows,
          }));
          setCurrentPage(current_page);
          setTotalPages(last_page);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [userToken]
  );

  useEffect(() => {
    loadProducts(currentPage);
  }, [loadProducts, currentPage]);

  const handleApprove = async (itemId) => {
    try {
      const res = await api.patch(
        `items/approve/${itemId}`,
        { status: 1 },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (res.status === 200) {
        loadProducts(currentPage);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenRejectDialog = (itemId) => {
    setSelectedItemId(itemId);
    setOpen(true);
  };

  const handleCloseRejectDialog = () => {
    setOpen(false);
    setSelectedItemId(null);
    setRejectionReason("");
  };

  const handleReject = async () => {
    try {
      const res = await api.patch(
        `items/reject/${selectedItemId}`,
        { status: 2, reject_reason: rejectionReason },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (res.status === 200) {
        handleCloseRejectDialog();
        loadProducts(currentPage);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const { columns, rows } = authorsTableData;

  return (
    <DashboardLayout>
      <DashboardNavbar refreshParentLogout={refreshParentLogout} />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Card>
            <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <SoftTypography variant="h6">Items to approve</SoftTypography>
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
          </Card>
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
      </SoftBox>

      <Dialog open={open} onClose={handleCloseRejectDialog}>
        <DialogTitle>Reason for Rejecting</DialogTitle>
        <DialogContent>
          <DialogContentText>Please provide a reason for rejecting this item.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Rejection Reason"
            type="text"
            fullWidth
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleReject} color="primary" disabled={!rejectionReason.trim()}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default ItemsApprovalTable;
