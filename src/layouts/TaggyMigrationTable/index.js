/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import SoftBadge from "components/SoftBadge";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";
import api from "../../assets/baseURL/api";
import moment from "moment";

const initialTableData = {
  columns: [
    { name: "User", align: "left" },
    { name: "Migration status", align: "left" },
    { name: "Selected items", align: "center" },
    { name: "Submitted at", align: "left" },
    { name: "Mapping status", align: "center" },
    { name: "Action", align: "center" },
  ],
  rows: [],
};

const emptyFilters = {
  search: "",
  decision: "",
  submitted_date: "",
  mapping_status: "",
};

const statusLabel = (status) =>
  status === "CONSENT_ACCOUNT_AND_ITEMS" ? "Account + Items" : "Account Only";

const mappingLabel = (status) => {
  if (!status) return "Not prepared";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const mappingColor = (status) => {
  if (status === "complete") return "success";
  if (status === "incomplete") return "warning";
  return "secondary";
};

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
          "Submitted at": (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
              {formatDate(migration.submitted_at)}
            </SoftTypography>
          ),
          "Mapping status": (
            <SoftBadge
              variant="gradient"
              badgeContent={mappingLabel(migration.mapping_status)}
              color={mappingColor(migration.mapping_status)}
              size="xs"
              container
            />
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

            <SoftBox display="flex" flexWrap="wrap" gap={2} px={3} pb={3} alignItems="center">
              <TextField
                size="small"
                label="Search name or email"
                name="search"
                value={filters.search}
                onChange={updateFilter}
              />
              <TextField
                select
                size="small"
                label="Consent type"
                name="decision"
                value={filters.decision}
                onChange={updateFilter}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">All consented</MenuItem>
                <MenuItem value="CONSENT_ACCOUNT_AND_ITEMS">Account + Items</MenuItem>
                <MenuItem value="CONSENT_ACCOUNT_ONLY">Account Only</MenuItem>
              </TextField>
              <TextField
                select
                size="small"
                label="Mapping status"
                name="mapping_status"
                value={filters.mapping_status}
                onChange={updateFilter}
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="complete">Complete</MenuItem>
                <MenuItem value="incomplete">Incomplete</MenuItem>
              </TextField>
              <TextField
                size="small"
                type="date"
                label="Submitted date"
                name="submitted_date"
                value={filters.submitted_date}
                onChange={updateFilter}
                InputLabelProps={{ shrink: true }}
              />
              <SoftButton variant="contained" color="primary" onClick={applyFilters}>
                Filter
              </SoftButton>
              <SoftButton variant="outlined" color="secondary" onClick={resetFilters}>
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
                <SoftBox display="flex" justifyContent="center" p={4}>
                  <CircularProgress size={28} />
                </SoftBox>
              ) : error ? (
                <SoftTypography variant="caption" color="error" display="block" textAlign="center" p={4}>
                  {error}
                </SoftTypography>
              ) : tableData.rows.length === 0 ? (
                <SoftTypography variant="caption" color="secondary" display="block" textAlign="center" p={4}>
                  No consented migrations found.
                </SoftTypography>
              ) : (
                <Table columns={tableData.columns} rows={tableData.rows} />
              )}
            </SoftBox>

            <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={2}>
              <SoftButton
                variant="contained"
                color="primary"
                onClick={() => setCurrentPage((page) => page - 1)}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </SoftButton>
              <SoftTypography variant="caption">
                Page {currentPage} of {totalPages}
              </SoftTypography>
              <SoftButton
                variant="contained"
                color="primary"
                onClick={() => setCurrentPage((page) => page + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </SoftButton>
            </SoftBox>
          </Card>
        </SoftBox>
      </SoftBox>
      <Footer />

      <MigrationDetailsDialog
        open={open}
        loading={detailLoading}
        migration={selectedMigration}
        onClose={closeDetails}
      />
    </DashboardLayout>
  );
}

function MigrationDetailsDialog({ open, loading, migration, onClose }) {
  const itemTable = {
    columns: [
      { name: "Item", align: "left" },
      { name: "Price", align: "left" },
      { name: "Snapshot status", align: "left" },
      { name: "Mapping status", align: "center" },
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
      "Mapping status": (
        <SoftBadge
          variant="gradient"
          badgeContent={mappingLabel(item.mapping_status)}
          color={mappingColor(item.mapping_status)}
          size="xs"
          container
        />
      ),
    })),
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth aria-labelledby="migration-details-title">
      <DialogTitle id="migration-details-title">Taggy Migration Details</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <SoftBox display="flex" justifyContent="center" p={4}>
            <CircularProgress size={28} />
          </SoftBox>
        ) : migration ? (
          <SoftBox>
            <DetailSection title="Profile migration snapshot">
              <Detail label="Name" value={`${migration.profile.first_name} ${migration.profile.last_name}`} />
              <Detail label="Email" value={migration.profile.email} />
              <Detail label="Phone" value={migration.profile.mobile_number} />
              <Detail label="Address" value={migration.profile.address} />
              <Detail label="Date of birth" value={migration.profile.date_of_birth} />
              <Detail label="Member since" value={formatDate(migration.profile.member_since)} />
              <Detail label="Source user ID" value={migration.profile.source_user_id} />
              <Detail label="Snapshot created" value={formatDate(migration.profile.snapshot_at)} />
              <Detail label="Profile mapping" value={mappingLabel(migration.profile.mapping_status)} />
            </DetailSection>

            <DetailSection title="Consent audit">
              <Detail label="Final decision" value={statusLabel(migration.consent.decision)} />
              <Detail label="Submitted at" value={formatDate(migration.consent.submitted_at)} />
              <Detail label="Consent version" value={migration.consent.consent_version} />
              <Detail label="Consent version ID" value={migration.consent.consent_version_id} />
              <Detail label="Selected items count" value={migration.consent.selected_item_count} />
              <Detail label="Consent content hash" value={migration.consent.consent_content_hash} wrap />
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
          </SoftBox>
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

function Detail({ label, value, wrap = false }) {
  return (
    <SoftBox>
      <SoftTypography variant="caption" color="secondary" fontWeight="medium">
        {label}: {" "}
      </SoftTypography>
      <SoftTypography
        variant="caption"
        color="secondary"
        sx={wrap ? { overflowWrap: "anywhere" } : undefined}
      >
        {value || "N/A"}
      </SoftTypography>
    </SoftBox>
  );
}

export default TaggyMigrationTable;
