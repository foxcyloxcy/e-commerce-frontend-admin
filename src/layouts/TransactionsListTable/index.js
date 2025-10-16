/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import Table from "examples/Tables/Table";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import api from "../../assets/baseURL/api";
import moment from "moment";

// Initial Data
const initialTransactionsTableData = {
  columns: [
    { name: "Date of Transaction", align: "left" },
    { name: "Transaction price", align: "left" },
    { name: "Platform fee", align: "left" },
    { name: "Buyer", align: "left" },
    { name: "Seller", align: "center" },
    { name: "Action", align: "center" },
  ],
  rows: [],
};

function TransactionsList(props) {
  const { userToken, refreshParentLogout } = props;
  const [transactionsTableData, setTransactionsTableData] = useState(initialTransactionsTableData);
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedTransactionItem, setSelectedTransactionItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const dateFormatter = (dateToFormat) =>
    moment(dateToFormat).format("YYYY/MM/DD, h:mm a");

  const loadTransactions = useCallback(async (page = 1) => {
    try {
      const res = await api.get(`transactions?page=${page}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (res.status === 200) {
                console.log(res.data.data)
        const data = res.data.data;
        setTotalPages(data.last_page);

        const newRows = data.data.map((transaction) => ({
          "Date of Transaction": (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
              {dateFormatter(transaction.transaction_item?.created_at)}
            </SoftTypography>
          ),
          "Transaction price": (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
              {transaction.transaction_item?.item?.total_fee_breakdown?.total ?? "N/A"}
            </SoftTypography>
          ),
          "Platform fee": (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
              {transaction.transaction_item?.item?.total_fee_breakdown?.platform_fee ?? "N/A"}
            </SoftTypography>
          ),
          Buyer: (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
              {(transaction.buyer.first_name) ? 
              (transaction.buyer?.first_name) + " " + (transaction.buyer?.last_name)
              :
              "Site Visitor" 
              }
            </SoftTypography>
          ),
          Seller: (
            <SoftTypography variant="caption" color="secondary" fontWeight="medium">
              {transaction.seller?.first_name} {transaction.seller?.last_name}
            </SoftTypography>
          ),
          Action: (
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

        setTransactionsTableData((prevState) => ({
          ...prevState,
          rows: newRows,
        }));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        refreshParentLogout();
      } else {
        console.error(error);
      }
    }
  }, [userToken, refreshParentLogout]);

  useEffect(() => {
    loadTransactions(currentPage);
  }, [currentPage]);

  const handleOpenModal = async (transaction) => {
    try {
      const res = await api.get(`transactions/${transaction.uuid}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (res.status === 200) {
        setSelectedTransaction(transaction);
        setSelectedTransactionItem(res.data.data.transaction);
        setOpen(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedTransaction(null);
    setSelectedTransactionItem(null);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const { columns, rows } = transactionsTableData;

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

              {/* Pagination */}
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
                <SoftTypography variant="caption">
                  Page {currentPage} of {totalPages}
                </SoftTypography>
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
          </Card>
        </SoftBox>
      </SoftBox>

      {/* Modal for Transaction Details */}
      {selectedTransactionItem && (
        <Dialog open={open} aria-labelledby="transaction-details-dialog">
          <DialogTitle id="transaction-details-dialog">Transaction Details</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <strong>Buyer:</strong> {selectedTransactionItem.buyer?.first_name}{" "}
              {selectedTransactionItem.buyer?.last_name} <br />
              <strong>Buyer Mobile:</strong> {selectedTransactionItem.buyer?.mobile_number} <br />
              <strong>Buyer Email:</strong> {selectedTransactionItem.buyer?.email} <br />
              <br />
              <strong>Seller:</strong> {selectedTransactionItem.seller?.first_name}{" "}
              {selectedTransactionItem.seller?.last_name} <br />
              <strong>Seller Mobile:</strong> {selectedTransactionItem.seller?.mobile_number} <br />
              <strong>Seller Email:</strong> {selectedTransactionItem.seller?.email} <br />
              <br />
              <strong>Date of Transaction:</strong>{" "}
              {dateFormatter(selectedTransactionItem.transaction_item?.created_at)} <br />
              <strong>Item Name:</strong>{" "}
              {selectedTransactionItem?.item} <br />
              <strong>Item Price:</strong>{" "}
              {selectedTransactionItem?.payment_breakdown?.item_price} <br />
              {/* <strong>Item Total:</strong>{" "}
              {selectedTransactionItem.transaction_item?.item?.total_fee_breakdown?.total} <br /> */}
              {/* <strong>Platform Fee Percentage:</strong>{" "}
              {selectedTransactionItem.transaction_item?.item?.total_fee_breakdown?.platform_fee_percentage}{" "}
              <br /> */}
              <strong>Platform Fee:</strong>{" "}
              {selectedTransactionItem?.payment_breakdown?.platform_fee_} <br />
              {/* <strong>Transaction Price:</strong>{" "}
              {selectedTransactionItem.transaction_item?.item?.total_fee_breakdown?.total} <br /> */}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <SoftButton
              component="button"
              variant="contained"
              color="primary"
              fontWeight="small"
              onClick={handleCloseModal}
            >
              Close
            </SoftButton>
          </DialogActions>
        </Dialog>
      )}
    </DashboardLayout>
  );
}

export default TransactionsList;
