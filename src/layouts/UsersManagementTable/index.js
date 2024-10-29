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
    { name: "Full name", align: "left" },
    { name: "Email", align: "left" },
    { name: "Phone no.", align: "left" },
    { name: "Created at", align: "left" },
    // { name: "action", align: "center" },
  ],
  rows: [],
};

function UsersManagement(props) {
  const { isLoggedIn, userData, userToken, refreshParentLogout } = props
  const [authorsTableData, setAuthorsTableData] = useState(initialAuthorsTableData);
  const [open, setOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      // const res = await api.get('users??page=1&limit=10&filter[keyword]=ian', {
      const res = await api.get('users?page=1&limit=1000', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      console.log(res.data)
      if (res.status === 200) {
        const data = res.data.data.data;

        const newRows = data.map((user) => ({
          'Full name': (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
              {user.first_name} {user.last_name}
            </SoftTypography>
          ),
          'Email': (
            <SoftTypography variant="caption" color="secondary" fontWeight="small"
            style={{
              whiteSpace: "normal",
              wordWrap: "break-word",
              width: '50px'
            }}>
              {user.email}
            </SoftTypography>
          ),
          'Phone no.': (
            <SoftTypography variant="caption" color="secondary" fontWeight="medium">
              {user.mobile_number}
            </SoftTypography>
          ),
          'Created at': (
            <SoftTypography variant="caption" color="secondary" fontWeight="medium">
              {dateFormatter(user.created_at)}
            </SoftTypography>
          ),
          // action: (
          //   <SoftBox display="flex" flexDirection="column">
          //     <SoftButton
          //       component="button"
          //       variant="contained"
          //       color="primary"
          //       fontWeight="small"
          //       sx={{ mb: 1 }}
          //       onClick={() => handleApprove(user.uuid)}
          //     >
          //       Approve
          //     </SoftButton>
          //   </SoftBox>
          // ),
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
              <SoftTypography variant="h6">Users Management</SoftTypography>
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

    </DashboardLayout>
  );
}

export default UsersManagement;
