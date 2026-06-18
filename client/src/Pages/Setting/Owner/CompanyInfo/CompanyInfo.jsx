import { useEffect, useState } from "react";
import useAuthStore from "../../../../store/useAuthStore";
import VIewCompanyInfo from "./VIewCompanyInfo";
import AddCompanyInfo from "./AddCompanyInfo";
import Toast from "../../../../Components/Toast";
import useCompanyStore from "../../../../store/useCompanyStore";

import { API_BASE_URL } from "../../../../config/api";

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/uploadCompanyLogo`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (res.ok) {
    return data.url;
  } else {
    throw new Error(data.error.message);
  }
};

function CompanyInfo() {
  const [company, setCompany] = useState({
    name: "",
    established: "",
    regNo: "",
    logo: null,
    address: "",
    dzongkhag: "",
    phone: "",
    email: "",
    website: "",

    fiscalYear: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [edit, setEdit] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState(null);
  const [ToastMsg, setToastMsg] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuthStore();
  const { companyInfo, setCompanyInfo } = useCompanyStore();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      setCompany({ ...company, [name]: files[0] });
    } else {
      setCompany({ ...company, [name]: value });
    }
  };

  useEffect(() => {
    if (companyInfo) {
      setCompany(companyInfo);
      setPreviewImage(company?.logo);
      setSubmitted(true);
    }
  }, [companyInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    // Validate all required fields
    const requiredFields = {
      name: "Company name",
      established: "Established date",
      regNo: "Registration number",
      address: "Address",
      dzongkhag: "Dzongkhag",
      phone: "Phone number",
      email: "Email address",
      fiscalYear: "Fiscal year",
    };
    const missingFields = [];

    Object.entries(requiredFields).forEach(([field, name]) => {
      if (!company[field]) {
        missingFields.push(name);
      }
    });

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields:\n${missingFields.join("\n")}`);
      return;
    }

    // Validate email format if email is provided
    if (company.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Validate phone number format if phone is provided
    if (company.phone && !/^[0-9+\- ]+$/.test(company.phone)) {
      alert("Please enter a valid phone number");
      return;
    }

    let profileImageUrl = previewImage;
    if (profileImage) {
      try {
        profileImageUrl = await uploadToCloudinary(profileImage);
      } catch (err) {
        console.error("Cloudinary upload failed:", err.message);
        setError(err.message);
        return;
      }
    }

    const dataToSend = { ...company, logo: profileImageUrl };

    const url = edit
      ? `${API_BASE_URL}/editCompanyInfo`
      : `${API_BASE_URL}/addCompanyInfo`;
    const method = edit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();

      if (response.ok) {
        setToastMsg(edit ? "Successfully Updated" : "Successfully Added");
        setShowToast(true);
        setCompanyInfo(responseData.companyInfo); // Update Zustand store
        setCompany(responseData.companyInfo);
        setSubmitted(true);
      } else {
        throw new Error(
          responseData.message || "Failed to update company info"
        );
      }
    } catch (error) {
      setToastMsg(error.message);
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto p-8 bg-white rounded-xl shadow-lg">
      {submitted ? (
        <VIewCompanyInfo
          company={company}
          setSubmitted={setSubmitted}
          setEdit={setEdit}
        />
      ) : (
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Company Information
          </h1>
          <AddCompanyInfo
            company={company}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
            setSubmitted={setSubmitted}
            setPreviewImage={setPreviewImage}
            setProfileImage={setProfileImage}
            previewImage={previewImage}
          />
        </div>
      )}

      {showToast && <Toast type="success" message={ToastMsg} duration={3000} />}
      {error && <Toast type="error" message={ToastMsg} />}
    </div>
  );
}

export default CompanyInfo;
