import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import SoftButton from "components/SoftButton";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import curved9 from "assets/images/curved-images/reloved_banner.jpeg";
import api from '../../../assets/baseURL/api';
import PropTypes from 'prop-types';

function SignIn({ refreshParent }) {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let errors = {};

    if (!formValues.email) {
      errors.email = 'Email or Phone no. field is required.';
    } else if (!validateEmail(formValues.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formValues.password) {
      errors.password = 'Password field is required.';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setLoading(true);
      try {
        const res = await api.post("/login", {
          email: formValues.email,
          password: formValues.password,
        });
        if (res.status === 200) {
          const data = res.data.data;

          localStorage.setItem(`userData`, JSON.stringify(data.user));
          localStorage.setItem(`userToken`, data.access_token);
          localStorage.setItem('isLoggedIn', true)

          refreshParent();
          navigate("/dashboard");
        }
      } catch (error) {
        console.log(error);
        handleErrorMessage(error.response);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleErrorMessage = useCallback((error) => {
    console.log(error)
    let errors = {};

    if (error.data.message) {
      if(error.data.message[0].email){
        setLoginError("Login failed! " + error.data.message[0].email);
      }

      if(error.data.message[0].password){
        setLoginError("Login failed! " + error.data.message[0].password);
      }
    }

    setFormErrors(errors);
  }, []);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
    setLoginError('');
  }, [formValues, formErrors]);

  return (
    <CoverLayout
      title="Welcome!"
      description="Enter admin credentials to sign in"
      image={curved9}
    >
      <SoftBox component="form" role="form" onSubmit={handleSubmit} noValidate>
        <SoftBox mb={2}>
          <SoftBox mb={1} ml={0.5}>
            <SoftTypography component="h1" variant="caption" fontWeight="bold">
              Email
            </SoftTypography>
          </SoftBox>
          <SoftInput
            type="email"
            placeholder="Email"
            name="email"
            icon={{ component: "input", direction: "none" }}
            value={formValues.email}
            onChange={handleInputChange}
            error={!!formErrors.email}
          />
          {formErrors.email && (
            <SoftTypography color="error" variant="caption">
              {formErrors.email}
            </SoftTypography>
          )}
        </SoftBox>
        <SoftBox mb={2}>
          <SoftBox mb={1} ml={0.5}>
            <SoftTypography component="h1" variant="caption" fontWeight="bold">
              Password
            </SoftTypography>
          </SoftBox>
          <SoftInput
            type="password"
            placeholder="Password"
            name="password"
            icon={{ component: "input", direction: "none" }}
            value={formValues.password}
            onChange={handleInputChange}
            error={!!formErrors.password}
          />
          {formErrors.password && (
            <SoftTypography color="error" variant="caption">
              {formErrors.password}
            </SoftTypography>
          )}
        </SoftBox>
        {loginError && (
          <SoftTypography color="error" variant="body2">
            {loginError}
          </SoftTypography>
        )}
        <SoftBox mt={4} mb={1} sx={{ position: 'relative' }}>
          <SoftButton
            variant="gradient"
            color="info"
            fullWidth
            type="submit"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </SoftButton>
        </SoftBox>
      </SoftBox>
    </CoverLayout>
  );
}

SignIn.propTypes = {
  refreshParent: PropTypes.func.isRequired,
};

export default SignIn;
