
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserPlus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState, useTransition } from "react";
import type { User } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getUsers as fetchUsers } from "@/lib/data";
import { deleteUser } from "@/lib/actions";

export default function ManageUsersPage() {
  const { user: currentUser, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace("/dashboard/user");
      } else {
        setIsLoadingData(true);
        const allUsers = fetchUsers();
        setUsers(allUsers);
        setIsLoadingData(false);
      }
    }
  }, [currentUser, isAdmin, authLoading, router, toast]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    // Prevent deleting the currently logged-in admin
    if (userToDelete.id === currentUser?.id && currentUser?.role === 'admin') {
      toast({
        title: "Action Denied",
        description: "You cannot delete your own admin account.",
        variant: "destructive",
      });
      setUserToDelete(null);
      return;
    }
     // Prevent deleting the main admin user (admin1) for demo purposes
    if (userToDelete.id === "admin1") {
      toast({
        title: "Action Denied",
        description: "The primary admin account (admin@example.com) cannot be deleted through this interface.",
        variant: "destructive",
      });
      setUserToDelete(null);
      return;
    }

    startTransition(async () => {
      const result = await deleteUser(userToDelete.id);
      if (result.success) {
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userToDelete.id));
        toast({ title: "User Deleted", description: result.message });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
      setUserToDelete(null);
    });
  };

  if (authLoading || !isAdmin || isLoadingData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg">Verifying admin access and loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl">Manage Users</CardTitle>
            <CardDescription>View, edit, and manage user accounts.</CardDescription>
          </div>
          <Button className="button-hover w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" /> Add New User
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
                <TableHead>Status</TableHead>
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
                    <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isPending}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">User Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled={isPending}>Edit User</DropdownMenuItem>
                        <DropdownMenuItem disabled={isPending || user.id === currentUser?.id || user.id === "admin1"}>
                          {user.role === 'user' ? 'Make Admin' : 'Make User'}
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={isPending || user.id === currentUser?.id || user.id === "admin1"}>
                          Deactivate User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setUserToDelete(user)}
                          className="text-destructive"
                          disabled={isPending || user.id === currentUser?.id || user.id === "admin1"}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {userToDelete && (
        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account for "{userToDelete.name}" ({userToDelete.email}).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)} disabled={isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                disabled={isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isPending ? "Deleting..." : "Delete User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
