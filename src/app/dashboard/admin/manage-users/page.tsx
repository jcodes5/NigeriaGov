"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import type { User } from "@/types"; // Assuming User type exists

// Mock user data
const mockUsers: User[] = [
  { id: "user1", name: "Aisha Bello", email: "aisha@example.com", role: "user" },
  { id: "user2", name: "Chinedu Okafor", email: "chinedu@example.com", role: "user" },
  { id: "admin1", name: "Admin User", email: "admin@example.com", role: "admin" },
  { id: "user3", name: "Yemi Adebayo", email: "yemi@example.com", role: "user" },
];


export default function ManageUsersPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (isAdmin) {
        // Simulate fetching users
        setUsers(mockUsers);
        setPageLoading(false);
      } else {
        // Handle non-admin access, perhaps redirect or show error
        console.error("Access denied: User is not an admin.");
        setPageLoading(false); 
      }
    }
  }, [isAdmin, authLoading]);

  if (authLoading || pageLoading) {
    return <p>Loading user management...</p>;
  }

  if (!isAdmin) {
    return <p>Access Denied. You must be an administrator to view this page.</p>
  }


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Manage Users</CardTitle>
            <CardDescription>View, edit, and manage user accounts.</CardDescription>
          </div>
          <Button className="button-hover">
            <UserPlus className="mr-2 h-4 w-4"/> Add New User
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead> {/* Example: Active/Inactive */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge> {/* Mock status */}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">User Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem>{user.role === 'user' ? 'Make Admin' : 'Make User'}</DropdownMenuItem>
                        <DropdownMenuItem>Deactivate User</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Add Pagination if many users */}
    </div>
  );
}
