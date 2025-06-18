
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
import { useEffect, useState, useTransition, useCallback } from "react";
import type { User } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getUsers as fetchUsersFromDB } from "@/lib/data"; // Renamed to avoid conflict
import { deleteUser } from "@/lib/actions";

export default function ManageUsersPage() {
  const { user: currentUser, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const allUsers = await fetchUsersFromDB();
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({ title: "Error", description: "Failed to load user data.", variant: "destructive" });
      setUsers([]); // Set to empty array on error
    } finally {
      setIsLoadingData(false);
    }
  }, [toast]);


  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace("/dashboard/user");
      } else {
        loadUsers();
      }
    }
  }, [currentUser, isAdmin, authLoading, router, toast, loadUsers]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    if (userToDelete.id === currentUser?.id && currentUser?.role === 'admin') {
      toast({
        title: "Action Denied",
        description: "You cannot delete your own admin account.",
        variant: "destructive",
      });
      setUserToDelete(null);
      return;
    }
    // This check might need updating if Supabase handles admin1 differently
    if (userToDelete.id === "admin1" && userToDelete.email === "admin@example.com") {
      toast({
        title: "Action Denied",
        description: "The primary mock admin account (admin@example.com) cannot be deleted.",
        variant: "destructive",
      });
      setUserToDelete(null);
      return;
    }

    startTransition(async () => {
      const result = await deleteUser(userToDelete.id);
      if (result.success) {
        // Optimistically update UI or re-fetch
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userToDelete.id));
        // await loadUsers(); // Or re-fetch for consistency
        toast({ title: "User Deleted", description: result.message });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
      setUserToDelete(null);
    });
  };

  if (authLoading || (!isAdmin && !authLoading)) { // Show loader if auth is loading OR if not admin and not finished auth loading
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg">Verifying admin access...</p>
      </div>
    );
  }
  
  if (isLoadingData && isAdmin) { // Show data loading indicator only if confirmed admin
     return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg">Loading user data...</p>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl">Manage Users</CardTitle>
            <CardDescription>View, edit, and manage user accounts from the database.</CardDescription>
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
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && !isLoadingData ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No users found in the database.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                    <TableCell>{user.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
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
                          <DropdownMenuItem disabled={isPending || user.id === currentUser?.id || (user.id === "admin1" && user.email === "admin@example.com")}>
                            {user.role === 'user' ? 'Make Admin' : 'Make User'}
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={isPending || user.id === currentUser?.id || (user.id === "admin1" && user.email === "admin@example.com")}>
                            Deactivate User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setUserToDelete(user)}
                            className="text-destructive"
                            disabled={isPending || user.id === currentUser?.id || (user.id === "admin1" && user.email === "admin@example.com")}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
                This action cannot be undone. This will permanently delete the user account for "{userToDelete.name}" ({userToDelete.email}) from the database.
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
