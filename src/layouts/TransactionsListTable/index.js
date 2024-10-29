/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import Table from "examples/Tables/Table";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField } from "@mui/material";
import api from "../../assets/baseURL/api";
import moment from "moment";

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
  const { isLoggedIn, userData, userToken, refreshParentLogout } = props;
  const [authorsTableData, setAuthorsTableData] = useState(initialAuthorsTableData);
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      const res = await api.get("transactions?page=1&limit=1000", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (res.status === 200) {
        const data = res.data.data.data;

        const newRows = data.map((transaction) => ({
          "Date of Transaction": (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
              {dateFormatter(transaction.transaction_item.created_at)}
            </SoftTypography>
          ),
          "Transaction price": (
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
              {transaction.transaction_item.item?.total_fee_breakdown?.total}
            </SoftTypography>
          ),
          "Platform fee": (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
              {transaction.transaction_item.item?.total_fee_breakdown?.platform_fee}
            </SoftTypography>
          ),
          Buyer: (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
              {transaction.buyer.first_name} {transaction.buyer.last_name}
            </SoftTypography>
          ),
          Seller: (
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
                onClick={() => handleOpenModal(transaction)}
              >
                Full details
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

  const handleOpenModal = (transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedTransaction(null);
  };

  const dateFormatter = (dateToFormat) => {
    let currentDate = moment(dateToFormat).format("YYYY/MM/DD, h:mm a");
    return currentDate;
  };

  const { columns, rows } = authorsTableData;

  return (
    <DashboardLayout>
      <DashboardNavbar refreshParentLogout={refreshParentLogout} />
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

      {/* Modal for Transaction Details */}
      {selectedTransaction && (
        <Dialog open={open} aria-labelledby="transaction-details-dialog">
          <DialogTitle id="transaction-details-dialog">Transaction Details</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <strong>Buyer:</strong> {selectedTransaction.buyer.first_name}{" "}
              {selectedTransaction.buyer.last_name} <br />
              <strong>Buyer Mobile:</strong> {selectedTransaction.buyer.mobile_number} <br />
              <strong>Buyer Email:</strong> {selectedTransaction.buyer.email} <br />
              <br />
              <strong>Seller:</strong> {selectedTransaction.seller.first_name}{" "}
              {selectedTransaction.seller.last_name} <br />
              <strong>Seller Mobile:</strong> {selectedTransaction.seller.mobile_number} <br />
              <strong>Seller Email:</strong> {selectedTransaction.seller.email} <br />
              <br />
              <strong>Date of Transaction:</strong> {dateFormatter(selectedTransaction.transaction_item.created_at)}{" "}
              <br />
              <strong>Item Total:</strong>{" "}
              {selectedTransaction.transaction_item.item?.total_fee_breakdown?.item} <br />
              <strong>Platform Fee Percentage:</strong>{" "}
              {selectedTransaction.transaction_item.item?.total_fee_breakdown?.platform_fee_percentage}{" "}
              <br />
              <strong>Platform Fee:</strong>{" "}
              {selectedTransaction.transaction_item.item?.total_fee_breakdown?.platform_fee} <br />
              <strong>Transaction Price:</strong>{" "}
              {selectedTransaction.transaction_item.item?.total_fee_breakdown?.total} <br />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <SoftButton
                component="button"
                variant="contained"
                color="primary"
                fontWeight="small"
                onClick={handleCloseModal}
              >Close</SoftButton>
          </DialogActions>
        </Dialog>
      )}
    </DashboardLayout>
  );
}

export default TransactionsList;
