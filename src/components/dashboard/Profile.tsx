import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Calendar, Star } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { apis } from "@/utils/apis";

// Define types for user and form data
interface UserType {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  location?: string;
  bio?: string;
  role?: { name?: string };
  created_at?: string;
  [key: string]: any;
}

interface FormDataType {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

export function Profile() {
  const location = useLocation();
  const { auth_me } = apis;
  const { Get } = useApi();
  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token");
  }, [location.search]);

  const initialValue: FormDataType = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  };

  const [user, setUser] = useState<UserType>({});
  const [formData, setFormData] = useState<FormDataType>(initialValue);

  // useEffect(() => {
  //   if (token !== null) {
  //     localStorage.setItem("token", token);
  //   }
  // }, [token]);

  useEffect(() => {
    const getMe = async () => {
      let data = await Get(auth_me);
      if (data?.user_id) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        // Populate formData with user data
        setFormData({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          phone: data.phone_number || "",
          location: data.location || "",
          bio: data.bio || "",
        });
      }
    };
    getMe();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  console.log(formData, 'formData')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <Button>Edit Profile</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="text-xl">
                  {user?.first_name?.length ? user?.first_name[0] : ''}{user?.last_name?.length ? user?.last_name[0] : ''}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user?.first_name}&nbsp;{user?.last_name}</CardTitle>
            <p className="text-muted-foreground">{user?.role?.name?.replace(/_/g, ' ')}</p>
            <div className="flex justify-center mt-2">
              <Badge variant="secondary" className="bg-success/10 text-success">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{user?.phone_number}</span>
            </div>
            {user?.location && <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{user?.location}</span>
            </div>}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>
                Joined {user?.created_at ? new Date(user.created_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long'
                }) : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">47</div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">8.7</div>
              <div className="text-sm text-muted-foreground">Avg Performance Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">6</div>
              <div className="text-sm text-muted-foreground">AI Personas Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">4</div>
              <div className="text-sm text-muted-foreground">Training Modes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}