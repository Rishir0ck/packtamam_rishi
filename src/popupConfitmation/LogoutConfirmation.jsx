/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { useAuthGuard } from "../Firebase/hooks/useAuthGuard";
import { useNavigate } from "react-router-dom";

const LogoutConfirmationModal = ({ isOpen, onClose, logo }) => {
  const { logout, loading: authLoading } = useAuthGuard();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogoutConfirm = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const result = await logout();

      if (result.success) {
        setMessage("Logout successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        let errorMessage = result.error || "Logout failed";
        if (result.step === "firebase_auth") {
          errorMessage = `Firebase Authentication Error: ${result.error}`;
        } else if (result.step === "server_auth") {
          errorMessage = `Server Authentication Error: ${result.error}`;
        }
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error("Unexpected logout error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || authLoading;

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      centered
      size="md"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">
          <div className="account-logo mb-3">
            {logo && (
              <img
                src={logo}
                alt="Logo"
                style={{ maxWidth: "80px" }}
                className="img-fluid"
              />
            )}
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center px-4 pb-4">
        <div className="mb-4">
          <i
            className="fas fa-sign-out-alt"
            style={{
              fontSize: "48px",
              color: "#c1a078",
              marginBottom: "20px",
            }}
          ></i>
          <h4 className="mb-3" style={{ color: "#403222" }}>
            Confirm Logout
          </h4>
          <p className="text-muted mb-4">
            Are you sure you want to logout from your account?
          </p>
          <p className="text-muted small">
            You will need to login again to access your dashboard.
          </p>
          {message && (
            <p className="text-danger small mt-2">
              {message}
            </p>
          )}
        </div>

        <div className="d-grid mb-3">
          <button
            className="btn btn-block"
            onClick={handleLogoutConfirm}
            disabled={isLoading}
            style={{
              backgroundColor: "#c1a078",
              color: "#fff",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Logging out...
              </>
            ) : (
              "Logout"
            )}
          </button>
        </div>

        <button
          className="btn btn-outline-secondary btn-block"
          onClick={onClose}
          disabled={isLoading}
          style={{
            color: "#403222",
            borderColor: "#403222",
            padding: "12px 24px",
            borderRadius: "5px",
          }}
        >
          Cancel
        </button>
      </Modal.Body>
    </Modal>
  );
};

export default LogoutConfirmationModal;
