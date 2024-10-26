/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import SoftInput from "components/SoftInput";
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
    { name: "status", align: "center" },
    { name: "Created at", align: "center" },
    { name: "action", align: "center" },
  ],
  rows: [],
};

function GenerateDiscountCodes(props) {
  const { isLoggedIn, userData, userToken, refreshParentLogout } = props
  const [authorsTableData, setAuthorsTableData] = useState(initialAuthorsTableData);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [formValues, setFormValues] = useState({ code: '', percentage: '' });
  const [formErrors, setFormErrors] = useState({ code: '', percentage: '' });


  const loadGeneratedCodes = useCallback(async () => {
    try {
      const res = await api.get(`discounts?page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (res.status === 200) {
        console.log(res.data)
        const data = res.data.data.data;

        const newRows = data.map((item) => ({
          'Code': (
            <SoftTypography variant="caption" color="secondary" fontWeight="small">
              {item.code}
            </SoftTypography>
          ),
          'Percentage': (
            <SoftTypography variant="caption" color="secondary" fontWeight="small"
            style={{
              whiteSpace: "normal",
              wordWrap: "break-word",
              width: '50px'
            }}>
              {item.discount_percentage}%
            </SoftTypography>
          ),
          status: (
            <SoftBadge
              variant="gradient"
              badgeContent={
                item.status === 0 ? "Disabled" : 
                item.status === 1 ? "Enabled" : "error"
              }
              color={
                item.status === 0 ? "secondary" : 
                item.status === 1 ? "success" : 
                "error"}
              size="xs"
              container
            />
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
                onClick={() => handleEnableCode(item.id)}
              >
                Enable
              </SoftButton>
              <SoftButton
                component="button"
                variant="contained"
                color="secondary"
                fontWeight="small"
                sx={{ mb: 1 }}
                onClick={() => handleDisableCode(item.id)}
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
    loadGeneratedCodes();
  }, [loadGeneratedCodes]);

  const handleEnableCode = async (id) => {
    try {
      const res = await api.patch(`discounts/${id}?`, 
        { status: 1 },
        {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      console.log(res)
      if (res.status === 200) {
        loadGeneratedCodes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleGenerateCode = async () => {
    let errors = {};

    if (!formValues.code) {
      errors.code = 'Enter code field is required.';
    }

    if (!formValues.percentage) {
      errors.percentage = 'Enter percentage field is required.';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const res = await api.post(`discounts`, 
          { code: formValues.code,
            discount_percentage : formValues.percentage
           },
          {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
        console.log(res)
        if (res.status === 200) {
          loadGeneratedCodes();
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const dateFormatter = (dateToFormat) =>{
    let currentDate = moment(dateToFormat).format('YYYY/MM/DD, h:mm a');

    return currentDate
  }

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  }, [formValues, formErrors]);


  const handleDisableCode = async (id) => {
    try {
      const res = await api.patch(`discounts/${id}?`, 
        { status: 0 },
        {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      console.log(res)
      if (res.status === 200) {
        loadGeneratedCodes();
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
            <SoftBox display="flex" flexDirection="row" sx={{ ml: 1, mb: 2 }}>
              <SoftInput
                placeholder="Enter code here..."
                type="code"
                name="code"
                icon={{ component: "none", direction: "left" }}
                value={formValues.code}
                onChange={handleInputChange}
                error={!!formErrors.code}
              />
              <SoftInput
                type="percentage"
                name="percentage"
                placeholder="No. of percentage here..."
                icon={{ component: "none", direction: "left" }}
                value={formValues.percentage}
                onChange={handleInputChange}
                error={!!formErrors.percentage}
              />
              <SoftButton
                component="button"
                variant="contained"
                color="primary"
                fontWeight="small"
                sx={{ ml: 1 }}
                onClick={() => handleGenerateCode()}
              >
                Generate Code
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
              <Table columns={columns} rows={rows} />
            </SoftBox>
          </Card>
        </SoftBox>
      </SoftBox>
    </DashboardLayout>
  );
}

export default GenerateDiscountCodes;
