import React, { useState } from "react";
import { Table } from "antd";
import { Link } from "react-router-dom";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { imagesend } from "../imagepath";
import { onShowSizeChange, itemRender } from "../Pagination";

const ManagementList = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const datasource = []; // Empty array as in original

  const openModal = (type, record = null) => {
    setActiveModal(type);
    setSelectedRecord(record);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedRecord(null);
  };

  const handleSubmit = (e, type) => {
    e.preventDefault();
    console.log(`${type} form submitted`, selectedRecord);
    closeModal();
  };

  const columns = [
    {
      title: "Restaurant Name",
      dataIndex: "Name",
      render: (text, record) => (
        <h2 className="profile-image">
          <Link to="#" className="avatar avatar-sm me-2">
            <img className="avatar-img rounded-circle" src={record.Img} alt="rounded circle" />
          </Link>
          <Link to="#">{record.Name}</Link>
        </h2>
      ),
    },
    { title: "Business Name", dataIndex: "BusinessName" },
    { title: "Restaurant Count", dataIndex: "RestaurantCount" },
    { title: "Outlet Type", dataIndex: "OutletType" },
    { title: "Total Order", dataIndex: "TotalOrder" },
    { title: "Pending Order", dataIndex: "PendingOrder" },
    { title: "Reject Order", dataIndex: "RejectOrder" },
    {
      title: 'Status',
      dataIndex: 'Status',
      render: (text) => (
        <span className={`custom-badge ${text === "Legal" ? "status-green" : "status-red"}`}>
          {text}
        </span>
      ),
    },
    {
      title: "",
      render: (_, record) => (
        <div className="text-end">
          <div className="dropdown dropdown-action">
            <Link to="#" className="action-icon dropdown-toggle" data-bs-toggle="dropdown">
              <i className="fas fa-ellipsis-v" />
            </Link>
            <div className="dropdown-menu dropdown-menu-end">
              <Link className="dropdown-item" to="#" onClick={() => openModal('view', record)}>
                <i className="far fa-eye me-2" /> View
              </Link>
              <Link className="dropdown-item" to="#" onClick={() => openModal('edit', record)}>
                <i className="far fa-edit me-2" /> Edit
              </Link>
              <Link className="dropdown-item" to="#" data-bs-toggle="modal" data-bs-target="#delete_patient">
                <i className="fa fa-trash-alt m-r-5"></i> Delete
              </Link>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const renderFormField = (label, name, type = "text", required = true) => (
    <div className="col-12 col-md-6">
      <div className="form-group local-forms">
        <label>{label} {required && <span className="login-danger">*</span>}</label>
        <input
          className="form-control"
          type={type}
          name={name}
          defaultValue={selectedRecord?.[name] || ""}
          required={required}
          {...(type === "number" && { step: "1", placeholder: "Enter count" })}
        />
      </div>
    </div>
  );

  const renderInfoCard = (title, value) => (
    <div className="col-md-6 mb-3">
      <div className="card bg-light">
        <div className="card-body p-3">
          <h6 className="card-title text-muted mb-1">{title}</h6>
          <p className="card-text h5 mb-0" style={{ color: "#403222" }}>{value}</p>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!activeModal || !selectedRecord) return null;

    const isView = activeModal === 'view';
    const isEdit = activeModal === 'edit';

    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title" style={{ color: "#403222" }}>
                {isView ? 'View Details' : 'Edit Management'}
              </h4>
              <button type="button" className="btn-close" onClick={closeModal}></button>
            </div>
            <div className="modal-body">
              {isView ? (
                <div className="card">
                  <div className="card-body">
                    <div className="row mb-4">
                      <div className="col-12 text-center">
                        <img className="avatar-img rounded-circle mb-3" src={selectedRecord.Img} 
                             alt="Restaurant" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                        <h4 style={{ color: "#403222" }}>{selectedRecord.Name}</h4>
                      </div>
                    </div>
                    <div className="row">
                      {renderInfoCard("Business Name", selectedRecord.BusinessName)}
                      {renderInfoCard("Restaurant Count", selectedRecord.RestaurantCount)}
                      {renderInfoCard("Outlet Type", selectedRecord.OutletType)}
                      {renderInfoCard("Total Orders", selectedRecord.TotalOrder)}
                      {renderInfoCard("Pending Orders", selectedRecord.PendingOrder)}
                      {renderInfoCard("Rejected Orders", selectedRecord.RejectOrder)}
                      <div className="col-12">
                        <div className="card bg-light">
                          <div className="card-body p-3 text-center">
                            <h6 className="card-title text-muted mb-1">Status</h6>
                            <span className={`badge fs-6 px-3 py-2 ${selectedRecord.Status === "Legal" ? "bg-success" : "bg-danger"}`}>
                              {selectedRecord.Status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => handleSubmit(e, 'edit')}>
                  <div className="row">
                    {renderFormField("Restaurant Name", "Name")}
                    {renderFormField("Business Name", "BusinessName")}
                    {renderFormField("Restaurant Count", "RestaurantCount", "number")}
                    {renderFormField("Outlet Type", "OutletType")}
                    {renderFormField("Total Order", "TotalOrder", "number")}
                    {renderFormField("Pending Order", "PendingOrder", "number")}
                    {renderFormField("Reject Order", "RejectOrder", "number")}
                    <div className="col-12 col-md-6">
                      <div className="form-group select-gender">
                        <label className="gen-label">Status <span className="login-danger">*</span></label>
                        {["Legal", "Fraud"].map(status => (
                          <div key={status} className="form-check-inline">
                            <label className="form-check-label">
                              <input type="radio" name="editStatus" className="form-check-input" 
                                     value={status} defaultChecked={selectedRecord.Status === status} />
                              {status}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
            <div className="modal-footer">
              <button type={isEdit ? "submit" : "button"} className="btn btn-primary" 
                      onClick={isView ? closeModal : undefined}
                      style={{ backgroundColor: "#c1a078", borderColor: "#c1a078", color: "#fff" }}>
                {isView ? 'Close' : 'Update'}
              </button>
              {isEdit && (
                <button type="button" className="btn btn-primary me-2" onClick={closeModal}
                        style={{ backgroundColor: "#c1a078", borderColor: "#c1a078", color: "#fff" }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <Sidebar id="menu-item3" id1="menu-items3" activeClassName="staff-list" />
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link style={{ color: "#403222" }} to="#">Management</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <div className="card card-table show-entire">
                <div className="card-body">
                  <div className="page-table-header mb-2">
                    <div className="row align-items-center">
                      <div className="col">
                        <div className="doctor-table-blk">
                          <h3 style={{ color: "#403222" }}>Management List</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="table-responsive doctor-list">
                    <Table
                      pagination={{
                        showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                        onShowSizeChange,
                        itemRender,
                      }}
                      columns={columns}
                      dataSource={datasource}
                      rowKey="id"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {renderModal()}

      {/* Delete Modal */}
      <div id="delete_patient" className="modal fade delete-modal" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center">
              <img src={imagesend} alt="#" width={50} height={46} />
              <h3>Are you sure want to delete this?</h3>
              <div className="m-t-20">
                <Link to="#" className="btn btn-white me-2" data-bs-dismiss="modal">Close</Link>
                <button type="submit" className="btn btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagementList;