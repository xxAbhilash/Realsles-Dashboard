import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Users, Calendar, MapPin, Phone, Mail, Edit, Trash2, ArrowLeft, TrendingUp, User } from "lucide-react";
import { useSelector } from "react-redux";
import { apis } from "@/utils/apis";
import { useApi } from "@/hooks/useApi";
import { showToast } from "@/lib/toastConfig";

export function Company() {
  const [companies, setCompanies] = useState([]);
  const [salesRepresentative, setSalesRepresentative] = useState([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateDialogOpenSrptt, setIsCreateDialogOpenSrptt] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState<any>(null);
  const [sms, setSms]: any = useState<object>({})
  const [allteam, setAllteam]: any = useState<[]>([])
  const [loading, setLoading] = useState(false);

  console.log(sms, "__sms__")

  console.log(companies, "__companies__")

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    location: "",
    phone_number: "",
    email: "",
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    name: "",
    industry: "",
    location: "",
    phone_number: "",
    email: ""
  });

  // Form data state Srptt
  const [formDataSrptt, setFormDataSrptt] = useState({
    firstName: "",
    lastName: "",
    phone_number: "",
    email: "",
    password: "",
  });

  // Form validation state srptt
  const [formSrpttErrors, setFormSrpttErrors] = useState({
    firstName: "",
    lastName: "",
    phone_number: "",
    email: "",
    password: "",
  });

  const user = useSelector((state: any) => state?.auth?.user);
  const { sales_companies, company_teams } = apis;
  const { Get, Post, Put, Delete } = useApi();

  const getCompaniesById = async () => {
    setLoading(true)
    try {
      let data = await Get(`${sales_companies}manager/${user?.user_id}`);
      if (data?.length) {
        setCompanies(data)
        setLoading(false)
      }
    } catch (error) {
      console.log(error, "_error_")
      showToast.error("Failed to fetch companies. Please try again.");
    } finally {
      setLoading(false)
    }
  }

  const getAllteam = async () => {
    try {
      let data = await Get(`${company_teams}manager/${user?.user_id}`);
      if (data?.length) {
        setAllteam(data)
      }
    } catch (error) {
      console.log(error, "_error_")
    }
  }

  const getSalesRepresentativesByCompanyId = async (companyId: string) => {
    try {
      // You'll need to add the appropriate API endpoint for fetching sales representatives

      // For now, we'll use mock data
      let data = await Get(`${sales_companies}${companyId}`)
      if (data?.users?.length) {
        setSalesRepresentative(data?.users);
      }
    } catch (error) {
      console.log(error, "_error_")
      showToast.error("Failed to fetch sales representatives. Please try again.");
    }
  }

  useEffect(() => {
    if (user?.user_id) {
      getCompaniesById();
      getAllteam();
    }
  }, [user?.user_id])

  useEffect(() => {
    if (sms?.sales_company_id || sms?.manager_id) {
      getSalesRepresentativesByCompanyId(sms?.sales_company_id || sms?.manager_id);
    }
  }, [sms?.sales_company_id, sms?.manager_id])

  console.log(companies, "__companiesById____")

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleInputChangeSrptt = (field: string, value: string) => {
    //     setFormDataSrptt
    // setFormSrpttErrors
    setFormDataSrptt(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (formSrpttErrors[field as keyof typeof formSrpttErrors]) {
      setFormSrpttErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };
  // Validate form data
  const validateForm = () => {
    const errors: any = {};

    if (!formData.name.trim()) {
      errors.name = "Company name is required";
    }

    if (!formData.industry.trim()) {
      errors.industry = "Industry is required";
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }

    if (!formData.phone_number.trim()) {
      errors.phone_number = "Phone number is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate form data for sales representative
  const validateFormSrptt = () => {
    const errors: any = {};

    if (!formDataSrptt.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formDataSrptt.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formDataSrptt.phone_number.trim()) {
      errors.phone_number = "Phone number is required";
    }

    if (!formDataSrptt.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formDataSrptt.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formDataSrptt.password.trim()) {
      errors.password = "Password is required";
    } else if (formDataSrptt.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    setFormSrpttErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form data for sales representative
  const resetFormSrptt = () => {
    setFormDataSrptt({
      firstName: "",
      lastName: "",
      phone_number: "",
      email: "",
      password: "",
    });
    setFormSrpttErrors({
      firstName: "",
      lastName: "",
      phone_number: "",
      email: "",
      password: "",
    });
  };

  const handleSubmitSrpt = async () => {
    if (!validateFormSrptt()) {
      return;
    }

    try {
      const newSalesRepresentative = {
        first_name: formDataSrptt.firstName,
        last_name: formDataSrptt.lastName,
        phone_number: formDataSrptt.phone_number,
        email: formDataSrptt.email,
        password: formDataSrptt.password,
      };

      // You'll need to add the appropriate API endpoint for creating sales representatives
      // const response = await Post(`${apis.sales_representatives}`, newSalesRepresentative);
      const data = await Post(`${sales_companies}${sms?.sales_company_id}/sales-representative`, newSalesRepresentative);

      // For now, we'll simulate the creation
      const mockResponse = { user_id: Date.now() };

      if (mockResponse?.user_id) {
        // Refresh the sales representatives list
        await getSalesRepresentativesByCompanyId(sms?.sales_company_id || sms?.manager_id);
        showToast.success("Sales representative created successfully!");
      }

      // Reset form and close dialog
      resetFormSrptt();
      setIsCreateDialogOpenSrptt(false);

    } catch (error) {
      console.error("Error creating sales representative:", error);
      showToast.error("Failed to create sales representative. Please try again.");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const newCompany = {
        ...formData,
        created: new Date().toISOString().split('T')[0],
        teams: 0,
        status: "active"
      };

      const response = await Post(sales_companies, newCompany);

      if (response?.manager_id) {
        getCompaniesById();
        showToast.success("Company created successfully!");
      }

      // For now, we'll add it to the local state
      const companyWithId = {
        ...newCompany,
        id: companies.length + 1
      };

      // setCompanies(prev => [...prev, companyWithId]);

      // Reset form and close dialog
      resetForm();
      setIsCreateDialogOpen(false);

    } catch (error) {
      console.error("Error creating company:", error);
      showToast.error("Failed to create company. Please try again.");
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      industry: "",
      location: "",
      phone_number: "",
      email: "",
    });
    setFormErrors({
      name: "",
      industry: "",
      location: "",
      phone_number: "",
      email: ""
    });
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleDialogCloseSrptt = (open: boolean) => {
    setIsCreateDialogOpenSrptt(open);
    if (!open) {
      resetFormSrptt();
    }
  };

  // Open edit dialog and populate form
  const handleEditClick = (company: any) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || "",
      industry: company.industry || "",
      location: company.location || "",
      phone_number: company.phone_number || "",
      email: company.email || "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle edit dialog close
  const handleEditDialogClose = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingCompany(null);
      resetForm();
    }
  };

  // Handle update submission
  const handleUpdate = async () => {
    if (!validateForm()) return;
    if (!editingCompany) return;

    try {
      const updatedCompany = {
        ...editingCompany,
        ...formData,
      };
      // Use sales_company_id or id as per your backend
      const id = editingCompany.sales_company_id || editingCompany.id;
      let data = await Put(`${sales_companies}${id}`, updatedCompany);
      if (data?.manager_id) {
        getCompaniesById();
        showToast.success("Company updated successfully!");
      }
      // setCompanies(prev =>
      //   prev.map(c => (c.id === editingCompany.id ? { ...c, ...updatedCompany } : c))
      // );
      setIsEditDialogOpen(false);
      setEditingCompany(null);
      resetForm();
    } catch (error) {
      console.error("Error updating company:", error);
      showToast.error("Failed to update company. Please try again.");
    }
  };

  // Delete company handler
  const handleDelete = async (company: any) => {
    if (!window.confirm(`Are you sure you want to delete "${company.name}"?`)) return;
    try {
      const id = company.sales_company_id || company.id;
      await Delete(`${sales_companies}${id}`);
      // Refresh the list after deletion
      getCompaniesById();
      showToast.success("Company deleted successfully!");
    } catch (error) {
      console.error("Error deleting company:", error);
      showToast.error("Failed to delete company. Please try again.");
    }
  };

  // Delete confirmation handlers
  const handleDeleteConfirm = async () => {
    if (!deletingCompany) return;
    try {
      const id = deletingCompany.sales_company_id || deletingCompany.id;
      await Delete(`${sales_companies}${id}`);
      getCompaniesById();
      showToast.success("Company deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeletingCompany(null);
    } catch (error) {
      console.error("Error deleting company:", error);
      showToast.error("Failed to delete company. Please try again.");
    }
  };

  const deleteRepresentative = async (user_id) => {
    try {
      // let data = await Delete(user_id)
    } catch (error) {

    }
  }

  const handleDeleteDialogClose = (open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) setDeletingCompany(null);
  };

  if (loading) {
    return <div className="p-6">Loading Company Data...</div>;
  }

  return (
    <>
      {sms?.manager_id ?
        <div className="p-6 space-y-6">
          {/* Header with back button */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSms({}); setSalesRepresentative([]); }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Company
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{sms?.name}</h1>
                <p className="text-muted-foreground">{sms?.company}</p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpenSrptt} onOpenChange={handleDialogCloseSrptt}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Sales Representative
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Sales representative</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="my-2 flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter First Name"
                        value={formDataSrptt.firstName}
                        onChange={(e) => handleInputChangeSrptt("firstName", e.target.value)}
                        className={formSrpttErrors.firstName ? "border-red-500" : ""}
                      />
                      {formSrpttErrors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{formSrpttErrors.firstName}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter Last Name"
                        value={formDataSrptt.lastName}
                        onChange={(e) => handleInputChangeSrptt("lastName", e.target.value)}
                        className={formSrpttErrors.lastName ? "border-red-500" : ""}
                      />
                      {formSrpttErrors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{formSrpttErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div className="my-2 flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        value={formDataSrptt.phone_number}
                        onChange={(e) => handleInputChangeSrptt("phone_number", e.target.value)}
                        className={formSrpttErrors.phone_number ? "border-red-500" : ""}
                      />
                      {formSrpttErrors.phone_number && (
                        <p className="text-red-500 text-xs mt-1">{formSrpttErrors.phone_number}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@company.com"
                        value={formDataSrptt.email}
                        onChange={(e) => handleInputChangeSrptt("email", e.target.value)}
                        className={formSrpttErrors.email ? "border-red-500" : ""}
                      />
                      {formSrpttErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{formSrpttErrors.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="my-2 flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        placeholder="Password"
                        value={formDataSrptt.password}
                        onChange={(e) => handleInputChangeSrptt("password", e.target.value)}
                        className={formSrpttErrors.password ? "border-red-500" : ""}
                      />
                      {formSrpttErrors.password && (
                        <p className="text-red-500 text-xs mt-1">{formSrpttErrors.password}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDialogCloseSrptt(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSubmitSrpt}
                    >
                      Create Sales representative
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Team Details Layout */}
          <div className="grid grid-cols-1 gap-6">
            {/* Left Side - Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Sales Representative ({salesRepresentative?.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {salesRepresentative?.length ? salesRepresentative?.map((member: any) => (
                  <div key={member?.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{member?.first_name}&nbsp;{member?.last_name}</div>
                        <div className="text-sm text-muted-foreground">{member?.email}</div>
                      </div>
                    </div>
                    {/* <div className="text-right">
                      <div className="font-bold text-lg text-primary">{member?.score}/10</div>
                      <div className="text-sm text-muted-foreground">{member?.sessions} sessions</div>
                    </div> */}
                    {/* <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => { deleteRepresentative(member?.user_id) }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button> */}
                  </div>
                )) : null}
              </CardContent>
            </Card>
          </div>
        </div>
        :
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Company Management</h1>
              <p className="text-muted-foreground">Create and manage companies under your supervision</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Company
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Company</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="my-2 flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        placeholder="Enter company name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={formErrors.name ? "border-red-500" : ""}
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="industry">Industry *</Label>
                      <Input
                        id="industry"
                        placeholder="e.g., Technology, Healthcare"
                        value={formData.industry}
                        onChange={(e) => handleInputChange("industry", e.target.value)}
                        className={formErrors.industry ? "border-red-500" : ""}
                      />
                      {formErrors.industry && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.industry}</p>
                      )}
                    </div>
                  </div>
                  <div className="my-2 flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone_number}
                        onChange={(e) => handleInputChange("phone_number", e.target.value)}
                        className={formErrors.phone_number ? "border-red-500" : ""}
                      />
                      {formErrors.phone_number && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.phone_number}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@company.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={formErrors.email ? "border-red-500" : ""}
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="my-2 flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="City, State"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className={formErrors.location ? "border-red-500" : ""}
                      />
                      {formErrors.location && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDialogClose(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSubmit}
                    >
                      Create Company
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Company Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">{companies.length}</div>
                    <div className="text-sm text-muted-foreground">Total Companies</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* <Card>
       <CardContent className="p-6">
         <div className="flex items-center gap-2">
           <Users className="w-5 h-5 text-success" />
           <div>
             <div className="text-2xl font-bold">
               {companies.reduce((acc, company) => acc + company.employees, 0) || 0}
             </div>
             <div className="text-sm text-muted-foreground">Total Employees</div>
           </div>
         </div>
       </CardContent>
     </Card> */}

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-info" />
                  <div>
                    <div className="text-2xl font-bold">
                      {/* {companies.reduce((acc, company) => acc + company.teams, 0) || 0} */}
                      {allteam?.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Teams</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-warning" />
                  <div>
                    <div className="text-2xl font-bold">
                      {companies.filter(c => c.is_active === true).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Companies</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Companies Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {companies?.length ? companies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between">
                <CardHeader onClick={() => setSms(company)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{company.industry}</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-success/10 text-success"
                    >
                      {company?.is_active ? "Active" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div onClick={() => setSms(company)} className="space-y-2">
                    {/* <div className="flex items-center gap-2 text-sm">
               <Users className="w-4 h-4 text-muted-foreground" />
               <span>{company.employees} employees</span>
             </div> */}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{company.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{company.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Created {company.created}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-center">
                      <div
                        className="text-lg font-bold text-primary">
                        {allteam?.length ? allteam.filter((val) => val?.sales_company_id === company?.sales_company_id).length : 0}</div>
                      <div className="text-xs text-muted-foreground">Teams</div>
                    </div>
                    <div className="flex gap-2">
                      <Button title="Edit" variant="outline" size="sm" onClick={() => handleEditClick(company)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        title="Delete"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setDeletingCompany(company);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : null}
          </div>

          {companies.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No companies yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first company to start organizing your sales teams.
                </p>
                <Button onClick={() => handleDialogClose(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Company
                </Button>
              </CardContent>
            </Card>
          )}

          <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogClose}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Company</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="my-2 flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="editCompanyName">Company Name *</Label>
                    <Input
                      id="editCompanyName"
                      placeholder="Enter company name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={formErrors.name ? "border-red-500" : ""}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="editIndustry">Industry *</Label>
                    <Input
                      id="editIndustry"
                      placeholder="e.g., Technology, Healthcare"
                      value={formData.industry}
                      onChange={(e) => handleInputChange("industry", e.target.value)}
                      className={formErrors.industry ? "border-red-500" : ""}
                    />
                    {formErrors.industry && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.industry}</p>
                    )}
                  </div>
                </div>
                <div className="my-2 flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="editPhone">Phone *</Label>
                    <Input
                      id="editPhone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange("phone_number", e.target.value)}
                      className={formErrors.phone_number ? "border-red-500" : ""}
                    />
                    {formErrors.phone_number && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phone_number}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="editEmail">Email *</Label>
                    <Input
                      id="editEmail"
                      type="email"
                      placeholder="contact@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>
                <div className="my-2 flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="editLocation">Location *</Label>
                    <Input
                      id="editLocation"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className={formErrors.location ? "border-red-500" : ""}
                    />
                    {formErrors.location && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEditDialogClose(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleUpdate}
                  >
                    Update Company
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogClose}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete Company</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>
                  Are you sure you want to delete {" "}
                  <span className="font-semibold">{deletingCompany?.name}</span>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => handleDeleteDialogClose(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-destructive text-white"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      }

    </>
  );
}