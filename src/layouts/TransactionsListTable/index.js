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
    { name: "Date of Transaction", align: "left" },
    { name: "Transaction price", align: "left" },
    { name: "Platform fee", align: "left" },
    { name: "Buyer", align: "left" },
    { name: "Seller", align: "center" },
    { name: "action", align: "center" },
  ],
  rows: [],
};

function TransactionsList(props) {
  const { isLoggedIn, userData, userToken, refreshParentLogout } = props
  const [authorsTableData, setAuthorsTableData] = useState(initialAuthorsTableData);
  const [open, setOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");


  const loadProducts = useCallback(async () => {
    try {
      const res = await api.get('transactions?page=1&limit=1000', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      console.log(res.data.data.data)
      if (res.status === 200) {
        const data = res.data.data.data;

        const newRows = data.map((transaction) => ({
          'Date of Transaction': (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
              {dateFormatter(transaction.transaction_item.created_at)}
            </SoftTypography>
          ),
          'Transaction price': (
            <SoftTypography variant="caption" color="secondary" fontWeight="small"
            style={{
              whiteSpace: "normal",
              wordWrap: "break-word",
              width: '50px'
            }}>
              {transaction.transaction_item.item?.total_fee_breakdown?.total}
            </SoftTypography>
          ),
          'Platform fee': (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
             {transaction.transaction_item.item?.total_fee_breakdown?.platform_fee}
            </SoftTypography>
          ),
          'Buyer': (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
              {transaction.buyer.first_name} {transaction.buyer.last_name}
            </SoftTypography>
          ),
          'Seller': (
            <SoftTypography variant="caption" color="secondary" fontWeight="medium">
              {transaction.seller.first_name} {transaction.seller.last_name}
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
                Details
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
              <SoftTypography variant="h6">Transactions</SoftTypography>
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

export default TransactionsList;
