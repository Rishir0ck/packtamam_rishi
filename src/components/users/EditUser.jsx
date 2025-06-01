// /* eslint-disable react/jsx-no-duplicate-props */
// /* eslint-disable no-unused-vars */
// import React, { useState } from "react";
// import Header from "../Header";
// import Sidebar from "../Sidebar";
// import { Link } from "react-router-dom";
// import { favicon, imagesend } from "../imagepath";
// import FeatherIcon from "feather-icons-react/build/FeatherIcon";
// import { DatePicker } from "antd";
// import Select from "react-select";


// const EditUser = () => {
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [options, setOptions] = useState([
//     { value: 1, label: "Select City" },
//     { value: 2, label: "Alaska" },
//     { value: 3, label: "California" },
//   ]);
//   const [option, setOption] = useState([
//     { value: 1, label: "Select Country" },
//     { value: 2, label: "Usa" },
//     { value: 3, label: "Uk" },
//     { value: 4, label: "Italy" },
//   ]);
//   const [statevalue, setStateValue] = useState([
//     { value: 1, label: "Select City" },
//     { value: 2, label: "Alaska" },
//     { value: 3, label: "California" },
//   ]);
//   const [department, setDepartment] = useState([
//     { value: 1, label: "Orthopedics" },
//     { value: 2, label: "Radiology" },
//     { value: 3, label: "Dentist" },
//   ]);

//   const [show, setShow] = useState(false);
//   const onChange = (date, dateString) => {
//     // console.log(date, dateString);
//   };
//   const loadFile = (event) => {
//     // Handle file loading logic here
//   };
//   return (
//     <div>
//       <Header />
//       <Sidebar
//         id="menu-item1"
//         id1="menu-items1"
//         activeClassName="edit-doctor"
//       />
//       <>
//         <div className="page-wrapper">
//           <div className="content">
//             {/* Page Header */}
//             <div className="page-header">
//               <div className="row">
//                 <div className="col-sm-12">
//                   <ul className="breadcrumb">
//                     <li className="breadcrumb-item">
//                       <Link style={{ color: "#403222" }} to="/userlist">User </Link>
//                     </li>
//                     <li className="breadcrumb-item">
//                       <i className="feather-chevron-right">
//                         <FeatherIcon style={{ color: "#403222" }} icon="chevron-right" />
//                       </i>
//                     </li>
//                     <li style={{ color: "#c1a078" }} className="breadcrumb-item active">Edit User</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//             {/* /Page Header */}
//             <div className="row">
//               <div className="col-sm-12">
//                 <div className="card">
//                   <div className="card-body">
//                     <form>
//                       <div className="row">
//                         <div className="col-12">
//                           <div className="form-heading">
//                             <h4 style={{ color: "#403222" }}>User Details</h4>
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-4">
//                           <div className="form-group local-forms">
//                             <label>
//                               Name <span className="login-danger">*</span>
//                             </label>
//                             <input
//                               className="form-control"
//                               type="text"
//                               defaultValue="Daniel"
//                             />
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-6">
//                           <div className="form-group local-forms">
//                             <label>
//                               Email <span className="login-danger">*</span>
//                             </label>
//                             <input
//                               className="form-control"
//                               type="email"
//                               defaultValue="example@email.com"
//                             />
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-4">
//                           <div className="form-group local-forms">
//                             <label>
//                               Role <span className="login-danger">*</span>
//                             </label>
//                             <Select
//                               defaultValue={selectedOption}
//                               onChange={setSelectedOption}
//                               options={department}
//                               id="search-commodity"
//                               components={{
//                                 IndicatorSeparator: () => null
//                               }}
//                               styles={{
//                                 control: (baseStyles, state) => ({
//                                   ...baseStyles,
//                                   borderColor: state.isFocused ?'none' : '2px solid rgba(46, 55, 164, 0.1);',
//                                    boxShadow: state.isFocused ? '0 0 0 1px #2e37a4' : 'none',
//                                   '&:hover': {
//                                     borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1)',
//                                   },
//                                   borderRadius: '10px',
//                                   fontSize: "14px",
//                                     minHeight: "45px",
//                                 }),
//                                 dropdownIndicator: (base, state) => ({
//                                   ...base,
//                                   transform: state.selectProps.menuIsOpen ? 'rotate(-180deg)' : 'rotate(0)',
//                                   transition: '250ms',
//                                   width: '35px',
//                                   height: '35px',
//                                 }),
//                               }}
//                             />
//                           </div>
//                         </div>
                        
//                         <div className="col-12 col-md-6 col-xl-6">
//                           <div className="form-group select-gender">
//                             <label className="gen-label">
//                               Status <span className="login-danger">*</span>
//                             </label>
//                             <div className="form-check-inline">
//                               <label className="form-check-label">
//                                 <input
//                                   type="radio"
//                                   name="gender1"
//                                   className="form-check-input"
//                                   defaultChecked="true"
//                                 />
//                                 Active
//                               </label>
//                             </div>
//                             <div className="form-check-inline">
//                               <label className="form-check-label">
//                                 <input
//                                   type="radio"
//                                   name="gender1"
//                                   className="form-check-input"
//                                 />
//                                 In Active
//                               </label>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="col-12">
//                           <div className="doctor-submit text-end">
//                             <button
//                             style={{ backgroundColor: "#c1a078", color: "#fff" }}
//                               type="submit"
//                               className="btn btn-primary submit-form me-2"
//                             >
//                               Submit
//                             </button>
//                             <button
//                             style={{ backgroundColor: "#c1a078", color: "#fff" }}
//                               type="submit"
//                               className="btn btn-primary cancel-form"
//                             >
//                               Cancel
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </form>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="notification-box">
//             <div className="msg-sidebar notifications msg-noti">
//               <div className="topnav-dropdown-header">
//                 <span>Messages</span>
//               </div>
//               <div className="drop-scroll msg-list-scroll" id="msg_list">
//                 <ul className="list-box">
//                   <li>
//                     <Link to="chat.html">
//                       <div className="list-item">
//                         <div className="list-left">
//                           <span className="avatar">R</span>
//                         </div>
//                         <div className="list-body">
//                           <span className="message-author">Richard Miles </span>
//                           <span className="message-time">12:28 AM</span>
//                           <div className="clearfix" />
//                           <span className="message-content">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing
//                           </span>
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="chat.html">
//                       <div className="list-item new-message">
//                         <div className="list-left">
//                           <span className="avatar">J</span>
//                         </div>
//                         <div className="list-body">
//                           <span className="message-author">John Doe</span>
//                           <span className="message-time">1 Aug</span>
//                           <div className="clearfix" />
//                           <span className="message-content">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing
//                           </span>
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="chat.html">
//                       <div className="list-item">
//                         <div className="list-left">
//                           <span className="avatar">T</span>
//                         </div>
//                         <div className="list-body">
//                           <span className="message-author">
//                             {" "}
//                             Tarah Shropshire{" "}
//                           </span>
//                           <span className="message-time">12:28 AM</span>
//                           <div className="clearfix" />
//                           <span className="message-content">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing
//                           </span>
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="chat.html">
//                       <div className="list-item">
//                         <div className="list-left">
//                           <span className="avatar">M</span>
//                         </div>
//                         <div className="list-body">
//                           <span className="message-author">Mike Litorus</span>
//                           <span className="message-time">12:28 AM</span>
//                           <div className="clearfix" />
//                           <span className="message-content">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing
//                           </span>
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="chat.html">
//                       <div className="list-item">
//                         <div className="list-left">
//                           <span className="avatar">C</span>
//                         </div>
//                         <div className="list-body">
//                           <span className="message-author">
//                             {" "}
//                             Catherine Manseau{" "}
//                           </span>
//                           <span className="message-time">12:28 AM</span>
//                           <div className="clearfix" />
//                           <span className="message-content">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing
//                           </span>
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="chat.html">
//                       <div className="list-item">
//                         <div className="list-left">
//                           <span className="avatar">D</span>
//                         </div>
//                         <div className="list-body">
//                           <span className="message-author">
//                             {" "}
//                             Domenic Houston{" "}
//                           </span>
//                           <span className="message-time">12:28 AM</span>
//                           <div className="clearfix" />
//                           <span className="message-content">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing
//                           </span>
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="chat.html">
//                       <div className="list-item">
//                         <div className="list-left">
//                           <span className="avatar">B</span>
//                         </div>
//                         <div className="list-body">
//                           <span className="message-author">
//                             {" "}
//                             Buster Wigton{" "}
//                           </span>
//                           <span className="message-time">12:28 AM</span>
//                           <div className="clearfix" />
//                           <span className="message-content">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing
//                           </span>
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="chat.html">
//                       <div className="list-item">
//                         <div className="list-left">
//                           <span className="avatar">R</span>
//                         </div>
//                         <div className="list-body">
//                           <span className="message-author">
//                             {" "}
//                             Rolland Webber{" "}
//                           </span>
//                           <span className="message-time">12:28 AM</span>
//                           <div className="clearfix" />
//                           <span className="message-content">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing
//                           </span>
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="chat.html">
//                       <div className="list-item">
//                         <div className="list-left">
//                           <span className="avatar">C</span>
//                         </div>
//                         <div className="list-body">
//                           <span className="message-author"> Claire Mapes </span>
//                           <span className="message-time">12:28 AM</span>
//                           <div className="clearfix" />
//                           <span className="message-content">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing
//                           </span>
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="chat.html">
//                       <div className="list-item">
//                         <div className="list-left">
//                           <span className="avatar">M</span>
//                         </div>
//                         <div className="list-body">
//                           <span className="message-author">Melita Faucher</span>
//                           <span className="message-time">12:28 AM</span>
//                           <div className="clearfix" />
//                           <span className="message-content">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing
//                           </span>
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="chat.html">
//                       <div className="list-item">
//                         <div className="list-left">
//                           <span className="avatar">J</span>
//                         </div>
//                         <div className="list-body">
//                           <span className="message-author">Jeffery Lalor</span>
//                           <span className="message-time">12:28 AM</span>
//                           <div className="clearfix" />
//                           <span className="message-content">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing
//                           </span>
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="chat.html">
//                       <div className="list-item">
//                         <div className="list-left">
//                           <span className="avatar">L</span>
//                         </div>
//                         <div className="list-body">
//                           <span className="message-author">Loren Gatlin</span>
//                           <span className="message-time">12:28 AM</span>
//                           <div className="clearfix" />
//                           <span className="message-content">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing
//                           </span>
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="chat.html">
//                       <div className="list-item">
//                         <div className="list-left">
//                           <span className="avatar">T</span>
//                         </div>
//                         <div className="list-body">
//                           <span className="message-author">
//                             Tarah Shropshire
//                           </span>
//                           <span className="message-time">12:28 AM</span>
//                           <div className="clearfix" />
//                           <span className="message-content">
//                             Lorem ipsum dolor sit amet, consectetur adipiscing
//                           </span>
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                 </ul>
//               </div>
//               <div className="topnav-dropdown-footer">
//                 <Link to="chat.html">See all messages</Link>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div
//           id="delete_patient"
//           className="modal fade delete-modal"
//           role="dialog"
//         >
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content">
//               <div className="modal-body text-center">
//                 <img src={imagesend} alt="" width={50} height={46} />
//                 <h3>Are you sure want to delete this ?</h3>
//                 <div className="m-t-20">
//                   {" "}
//                   <Link
//                     to="#"
//                     className="btn btn-white me-2"
//                     data-bs-dismiss="modal"
//                   >
//                     Close
//                   </Link>
//                   <button type="submit" className="btn btn-danger">
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </>
//     </div>
//   );
// };

// export default EditUser;
