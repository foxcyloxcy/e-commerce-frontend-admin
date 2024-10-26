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
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";
import api from "../../assets/baseURL/api";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField } from "@mui/material";
import moment from 'moment';

// Initial Data
const initialAuthorsTableData = {
  columns: [
    { name: "Code", align: "left" },
    { name: "Percentage", align: "left" },
    { name: "Status", align: "left" },
    // { name: "status", align: "center" },
    { name: "Created at", align: "center" },
    { name: "action", align: "center" },
  ],
  rows: [],
};

function GenerateDiscoutCodes(props) {
  const { isLoggedIn, userData, userToken, refreshParentLogout } = props
  console.log(userToken)
  const [authorsTableData, setAuthorsTableData] = useState(initialAuthorsTableData);
  const [open, setOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");


  const loadProducts = useCallback(async () => {
    try {
      const res = await api.get('items/status/pending', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (res.status === 200) {
        const data = res.data.data.data;

        const newRows = data.map((item) => ({
          'Code': (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
              {item.item_name}
            </SoftTypography>
          ),
          'Percentage': (
            <SoftTypography variant="caption" color="secondary" fontWeight="small"
            style={{
              whiteSpace: "normal",
              wordWrap: "break-word",
              width: '50px'
            }}>
              {item.item_description}
            </SoftTypography>
          ),
          'Status': (
            <SoftBox mr={2}>
              <SoftAvatar src={item.default_image ? item.default_image.image_url : item.item_image[0]} alt={item.item_name} size="sm" variant="rounded" />
            </SoftBox>
          ),
          'Created at': (
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
                Enable
              </SoftButton>
              <SoftButton
                component="button"
                variant="contained"
                color="primary"
                fontWeight="small"
                sx={{ mb: 1 }}
                onClick={() => handleOpenRejectDialog(item.uuid)}
              >
                Disable
              </SoftButton>
            </SoftBox>
          ),
        }));

        setAuthorsTableData((prevState) => ({
          ...prevState,
          rows: newRows,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  }, [userToken]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleApprove = async (itemId) => {
    try {
      const res = await api.patch(`items/approve/${itemId}`, 
        { status: 1 },
        {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      console.log(res)
      if (res.status === 200) {
        loadProducts();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenRejectDialog = (itemId) => {
    setSelectedItemId(itemId);
    setOpen(true);
  };

  const dateFormatter = (dateToFormat) =>{
    let currentDate = moment(dateToFormat).format('YYYY/MM/DD, h:mm a');

    return currentDate
  }

  const handleCloseRejectDialog = () => {
    setOpen(false);
    setSelectedItemId(null);
    setRejectionReason("");
  };

  const handleReject = async () => {
    try {
      const res = await api.patch(`items/reject/${selectedItemId}`, 
        { status: 2, reject_reason: rejectionReason }, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      if (res.status === 200) {
        handleCloseRejectDialog();
        loadProducts();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const { columns, rows } = authorsTableData;

  return (
    <DashboardLayout>
      <DashboardNavbar refreshParentLogout={refreshParentLogout}/>
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Card>
            <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <SoftTypography variant="h6">Discount Codes</SoftTypography>
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
      </SoftBox>

      <Dialog open={open} onClose={handleCloseRejectDialog}>
        <DialogTitle>Reason for Rejecting</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for rejecting this item.
          </DialogContentText>
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
          <Button onClick={handleReject} color="primary">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default GenerateDiscoutCodes;
