/* eslint-disable react/prop-types */
import React from "react";
import { Modal } from "react-bootstrap";

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm, logo, isLoading = false }) => {
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
            <img
              src={logo}
              alt="Logo"
              style={{ maxWidth: "80px" }}
              className="img-fluid"
            />
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
              marginBottom: "20px" 
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
        </div>
        
        <div className="d-grid gap-2">
          <button
            className="btn btn-block mb-2"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              backgroundColor: "#c1a078",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "5px"
            }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging out...
              </>
            ) : (
              "Yes, Logout"
            )}
          </button>
          
          <button
            className="btn btn-outline-secondary btn-block"
            onClick={onClose}
            disabled={isLoading}
            style={{
              color: "#403222",
              borderColor: "#403222",
              padding: "12px 24px",
              borderRadius: "5px"
            }}
          >
            Cancel
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LogoutConfirmationModal;