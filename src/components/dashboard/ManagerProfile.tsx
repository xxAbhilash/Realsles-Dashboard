import { useEffect, useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { apis } from "@/utils/apis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Calendar, Building2, Users, Target } from "lucide-react";

// Define types for manager and form data
interface ManagerType {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  location?: string;
  bio?: string;
  department?: string;
  role?: { name?: string };
  created_at?: string;
  companies_managed?: number;
  teams_created?: number;
  team_members?: number;
  avg_team_performance?: number;
  [key: string]: any;
}

interface FormDataType {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  bio: string;
}

export function ManagerProfile() {
  const { auth_me } = apis; // You may need to define this endpoint in apis.ts
  const { Get } = useApi();

  const initialValue: FormDataType = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    department: "",
    bio: "",
  };

  const [manager, setManager] = useState<ManagerType>({});
  const [formData, setFormData] = useState<FormDataType>(initialValue);

  useEffect(() => {
    const getManager = async () => {
      let data = await Get(auth_me);
      if (data?.user_id) {
        setManager(data);
        // Populate formData with manager data
        setFormData({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          phone: data.phone_number || "",
          location: data.location || "",
          department: data.department || "",
          bio: data.bio || "",
        });
      }
    };
    getManager();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and view your management overview</p>
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
                  {manager?.first_name?.length ? manager?.first_name[0] : ''}{manager?.last_name?.length ? manager?.last_name[0] : ''}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{manager?.first_name}&nbsp;{manager?.last_name}</CardTitle>
            <p className="text-muted-foreground">{manager?.role?.name?.replace(/_/g, ' ') || 'Sales Manager'}</p>
            <div className="flex justify-center mt-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Manager
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{manager?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{manager?.phone_number}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{manager?.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Manager since {manager?.created_at ? new Date(manager.created_at).toLocaleString('en-US', { year: 'numeric', month: 'long' }) : ''}</span>
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
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" value={formData.department} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" placeholder="Tell us about yourself..." value={formData.bio} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{manager?.companies_managed ?? 0}</div>
                <div className="text-sm text-muted-foreground">Companies Managed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-success" />
              <div>
                <div className="text-2xl font-bold">{manager?.teams_created ?? 0}</div>
                <div className="text-sm text-muted-foreground">Teams Created</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-info" />
              <div>
                <div className="text-2xl font-bold">{manager?.team_members ?? 0}</div>
                <div className="text-sm text-muted-foreground">Team Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-warning" />
              <div>
                <div className="text-2xl font-bold">{manager?.avg_team_performance ?? 0}</div>
                <div className="text-sm text-muted-foreground">Avg Team Performance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - keep static or make dynamic if you have data */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Management Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Created new team "West Coast Sales"</div>
                <div className="text-sm text-muted-foreground">Added 5 members to the team • 2 days ago</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Team performance review completed</div>
                <div className="text-sm text-muted-foreground">"Enterprise Solutions" team quarterly review • 1 week ago</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-info" />
              </div>
              <div className="flex-1">
                <div className="font-medium">New company "TechCorp Solutions" added</div>
                <div className="text-sm text-muted-foreground">Company profile setup and team structure created • 2 weeks ago</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}