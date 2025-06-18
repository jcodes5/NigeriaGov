
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
import type { User as AppUser } from "@/types"; // Renamed to AppUser
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getUsers as fetchUsersFromDB } from "@/lib/data";
import { deleteUser as deleteUserAction } from "@/lib/actions"; // Renamed server action import

export default function ManageUsersPage() {
  const { profile: currentUserProfile, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const allUsers = await fetchUsersFromDB();
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({ title: "Error", description: "Failed to load user data.", variant: "destructive" });
      setUsers([]);
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
  }, [currentUserProfile, isAdmin, authLoading, router, toast, loadUsers]);

  const handleDeleteUser = async () => {
    if (!userToDelete || !userToDelete.id) return;

    if (userToDelete.id === currentUserProfile?.id && currentUserProfile?.role === 'admin') {
      toast({
        title: "Action Denied",
        description: "You cannot delete your own admin account.",
        variant: "destructive",
      });
      setUserToDelete(null);
      return;
    }
    
    // Deletion of Supabase auth user itself is more complex and requires admin privileges on Supabase.
    // This action primarily deletes from the public 'users' table.
    // Add specific checks if there are critical users you don't want deleted from public.users
    // e.g. if (userToDelete.email === "superadmin@example.com") { ... }


    startTransition(async () => {
      // Call the renamed server action
      const result = await deleteUserAction(userToDelete.id!); 
      if (result.success) {
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userToDelete.id));
        toast({ title: "User Profile Deleted", description: result.message });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
      setUserToDelete(null);
    });
  };
  
  const overallLoading = authLoading || (isLoadingData && isAdmin);

  if (overallLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg">{authLoading ? "Verifying admin access..." : "Loading user data..."}</p>
      </div>
    );
  }
  
  if (!isAdmin && !authLoading) { // Fallback if useEffect redirect fails
      return null; 
  }


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl">Manage Users</CardTitle>
            <CardDescription>View, edit, and manage user profiles from the database.</CardDescription>
          </div>
          <Button className="button-hover w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" /> Add New User (Coming Soon)
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
                    No user profiles found in the database.
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
                          <DropdownMenuItem disabled={isPending}>Edit User (Coming Soon)</DropdownMenuItem>
                          <DropdownMenuItem disabled={isPending || user.id === currentUserProfile?.id}>
                            {user.role === 'user' ? 'Make Admin (Coming Soon)' : 'Make User (Coming Soon)'}
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={isPending || user.id === currentUserProfile?.id}>
                            Deactivate User (Coming Soon)
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setUserToDelete(user)}
                            className="text-destructive"
                            disabled={isPending || user.id === currentUserProfile?.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User Profile
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
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will delete the user profile for "{userToDelete.name || userToDelete.email}" from the public user table. This does not automatically delete their Supabase authentication account. Are you sure you want to proceed?
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
                {isPending ? "Deleting..." : "Delete Profile"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
