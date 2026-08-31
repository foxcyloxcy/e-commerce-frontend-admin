/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import SoftBadge from "components/SoftBadge";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftInput from "components/SoftInput";
import SoftTypography from "components/SoftTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Table from "examples/Tables/Table";
import api from "../../assets/baseURL/api";
import moment from "moment";

const initialTableData = {
  columns: [
    { name: "User", align: "left" },
    { name: "Migration status", align: "left" },
    { name: "Selected items", align: "center" },
    { name: "Submitted date", align: "left" },
    { name: "Action", align: "center" },
  ],
  rows: [],
};

const emptyFilters = {
  search: "",
  decision: "",
  submitted_date: "",
};

const statusLabel = (status) =>
  status === "CONSENT_ACCOUNT_AND_ITEMS" ? "Account + Items" : "Account Only";

const formatDate = (date) => (date ? moment(date).format("YYYY/MM/DD, h:mm a") : "N/A");

function TaggyMigrationTable({ userToken, refreshParentLogout }) {
  const [tableData, setTableData] = useState(initialTableData);
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedMigration, setSelectedMigration] = useState(null);

  const loadMigrations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("migrations", {
        headers: { Authorization: `Bearer ${userToken}` },
        params: { page: currentPage, size: 10, ...appliedFilters },
      });
      const data = res.data.data;
      setTotalPages(data.last_page || 1);
      setTableData({
        ...initialTableData,
        rows: data.data.map((migration) => ({
          User: (
            <SoftBox display="flex" flexDirection="column">
              <SoftTypography variant="caption" color="secondary" fontWeight="medium">
                {migration.user.name || "N/A"}
              </SoftTypography>
              <SoftTypography variant="caption" color="secondary" fontWeight="small">
                {migration.user.email}
              </SoftTypography>
            </SoftBox>
          ),
          "Migration status": (
            <SoftBadge
              variant="gradient"
              badgeContent={statusLabel(migration.status)}
              color="info"
              size="xs"
              container
            />
          ),
          "Selected items": (
            <SoftTypography variant="caption" color="secondary" fontWeight="medium">
              {migration.selected_item_count}
            </SoftTypography>
          ),
          "Submitted date": (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
              {formatDate(migration.submitted_at)}
            </SoftTypography>
          ),
          Action: (
            <SoftButton
              component="button"
              variant="contained"
              color="primary"
              fontWeight="small"
              onClick={() => openDetails(migration.id)}
            >
              View
            </SoftButton>
          ),
        })),
      });
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        refreshParentLogout();
      } else {
        setError("Unable to load Taggy migrations.");
      }
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, currentPage, refreshParentLogout, userToken]);

  useEffect(() => {
    loadMigrations();
  }, [loadMigrations]);

  const openDetails = async (migrationCaseId) => {
    setOpen(true);
    setDetailLoading(true);
    setSelectedMigration(null);
    try {
      const res = await api.get(`migrations/${migrationCaseId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setSelectedMigration(res.data.data);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        refreshParentLogout();
        setOpen(false);
      } else {
        setError("Unable to load migration details.");
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const closeDetails = () => {
    setOpen(false);
    setSelectedMigration(null);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar refreshParentLogout={refreshParentLogout} />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Card>
            <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <SoftTypography variant="h6">Taggy migrations</SoftTypography>
            </SoftBox>

            <SoftBox display="flex" flexWrap="wrap" alignItems="flex-end" sx={{ ml: 1, mb: 2, gap: 1 }}>
              <FilterField label="Search" width={{ xs: "calc(100% - 1rem)", sm: 210 }}>
                <SoftInput
                  placeholder="Name or email"
                  name="search"
                  value={filters.search}
                  onChange={updateFilter}
                />
              </FilterField>
              <FilterField label="Consent type" width={{ xs: "calc(100% - 1rem)", sm: 180 }}>
                <FilterSelect name="decision" value={filters.decision} onChange={updateFilter}>
                  <MenuItem value="">All consented</MenuItem>
                  <MenuItem value="CONSENT_ACCOUNT_AND_ITEMS">Account + Items</MenuItem>
                  <MenuItem value="CONSENT_ACCOUNT_ONLY">Account Only</MenuItem>
                </FilterSelect>
              </FilterField>
              <FilterField label="Submitted date" width={{ xs: "calc(100% - 1rem)", sm: 170 }}>
                <SoftInput
                  type="date"
                  name="submitted_date"
                  value={filters.submitted_date}
                  onChange={updateFilter}
                />
              </FilterField>
              <SoftButton component="button" variant="contained" color="primary" fontWeight="small" onClick={applyFilters}>
                Filter
              </SoftButton>
              <SoftButton component="button" variant="contained" color="secondary" fontWeight="small" onClick={resetFilters}>
                Reset
              </SoftButton>
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
              {loading ? (
                <SoftBox display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </SoftBox>
              ) : error ? (
                <SoftTypography variant="caption" color="error" display="block" textAlign="center" p={2}>
                  {error}
                </SoftTypography>
              ) : tableData.rows.length === 0 ? (
                <SoftTypography variant="caption" color="secondary" display="block" textAlign="center" p={2}>
                  No consented migrations found.
                </SoftTypography>
              ) : (
                <Table columns={tableData.columns} rows={tableData.rows} />
              )}
            </SoftBox>

          </Card>
        </SoftBox>
        <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={2}>
          <SoftButton
            component="button"
            variant="contained"
            color="primary"
            fontWeight="small"
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </SoftButton>
          <SoftTypography variant="caption">Page {currentPage} of {totalPages}</SoftTypography>
          <SoftButton
            component="button"
            variant="contained"
            color="primary"
            fontWeight="small"
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </SoftButton>
        </SoftBox>
      </SoftBox>
      <MigrationDetailsDialog
        open={open}
        loading={detailLoading}
        migration={selectedMigration}
        onClose={closeDetails}
      />
    </DashboardLayout>
  );
}

function FilterField({ label, width, children }) {
  return (
    <SoftBox width={width}>
      <SoftTypography variant="caption" color="secondary" fontWeight="medium" display="block" mb={0.5}>
        {label}
      </SoftTypography>
      {children}
    </SoftBox>
  );
}

function FilterSelect({ children, ...props }) {
  return (
    <Select
      {...props}
      size="small"
      fullWidth
      sx={{
        height: "2.5rem !important",
        padding: "0.5rem 0.75rem !important",
        display: "flex !important",
        placeItems: "initial !important",
        fontSize: "0.875rem !important",
        "& .MuiSelect-select": { padding: "0 !important", display: "flex", alignItems: "center" },
      }}
    >
      {children}
    </Select>
  );
}

function MigrationDetailsDialog({ open, loading, migration, onClose }) {
  const itemTable = {
    columns: [
      { name: "Item", align: "left" },
      { name: "Price", align: "left" },
      { name: "Snapshot status", align: "left" },
    ],
    rows: (migration?.items || []).map((item) => ({
      Item: (
        <SoftBox display="flex" flexDirection="column">
          <SoftTypography variant="caption" color="secondary" fontWeight="medium">
            {item.item_name || "N/A"}
          </SoftTypography>
          <SoftTypography variant="caption" color="secondary" fontWeight="small">
            {item.item_description || ""}
          </SoftTypography>
        </SoftBox>
      ),
      Price: `AED ${item.price || 0}`,
      "Snapshot status": item.status_name || "N/A",
    })),
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="migration-details-title">
      <DialogTitle id="migration-details-title">Taggy Migration Details</DialogTitle>
      <DialogContent>
        {loading ? (
          <SoftBox display="flex" justifyContent="center" p={4}>
            <CircularProgress size={28} />
          </SoftBox>
        ) : migration ? (
          <DialogContentText component="div">
            <DetailSection title="Profile migration snapshot">
              <Detail label="Name" value={`${migration.profile.first_name} ${migration.profile.last_name}`} />
              <Detail label="Email" value={migration.profile.email} />
              <Detail label="Phone" value={migration.profile.mobile_number} />
              <Detail label="Address" value={migration.profile.address} />
              <Detail label="Date of birth" value={migration.profile.date_of_birth} />
              <Detail label="Member since" value={formatDate(migration.profile.member_since)} />
            </DetailSection>

            <DetailSection title="Consent audit">
              <Detail label="Final decision" value={statusLabel(migration.consent.decision)} />
              <Detail label="Submitted at" value={formatDate(migration.consent.submitted_at)} />
            </DetailSection>

            <SoftBox mt={3}>
              <SoftTypography variant="h6" mb={1}>
                Selected migration items
              </SoftTypography>
              {migration.status === "CONSENT_ACCOUNT_ONLY" ? (
                <SoftTypography variant="caption" color="secondary">
                  Account-only migration — no listings were selected for transfer.
                </SoftTypography>
              ) : itemTable.rows.length ? (
                <Table columns={itemTable.columns} rows={itemTable.rows} />
              ) : (
                <SoftTypography variant="caption" color="secondary">
                  No selected eligible migration items were stored.
                </SoftTypography>
              )}
            </SoftBox>
          </DialogContentText>
        ) : (
          <SoftTypography variant="caption" color="secondary">
            Migration details are unavailable.
          </SoftTypography>
        )}
      </DialogContent>
      <DialogActions>
        <SoftButton variant="contained" color="primary" onClick={onClose}>
          Close
        </SoftButton>
      </DialogActions>
    </Dialog>
  );
}

function DetailSection({ title, children }) {
  return (
    <SoftBox mb={3}>
      <SoftTypography variant="h6" mb={1}>
        {title}
      </SoftTypography>
      <SoftBox display="grid" sx={{ gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1 }}>
        {children}
      </SoftBox>
    </SoftBox>
  );
}

function Detail({ label, value }) {
  return (
    <SoftBox>
      <SoftTypography variant="caption" color="secondary" fontWeight="medium">
        {label}: {" "}
      </SoftTypography>
      <SoftTypography variant="caption" color="secondary">
        {value || "N/A"}
      </SoftTypography>
    </SoftBox>
  );
}

export default TaggyMigrationTable;
