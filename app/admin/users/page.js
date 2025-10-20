"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash,
  UserPlus,
  Download,
  Mail,
  Phone,
  User,
  Shield,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {AdminLayout} from "@/components/layout-admin"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { m } from "framer-motion"
const bcrypt = require('bcryptjs')

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [email, setEmail] = useState('')



  // Form states
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
    password: "",
    user_id: "",
  })

  const [formErrors, setFormErrors] = useState({})

  // Fetch users from supabase on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Clean up any potential scroll locks when component unmounts
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("radix-dialog-scroll-lock")
      document.documentElement.style.removeProperty("padding-right")
      document.body.style.removeProperty("overflow")
    }
  }, [])

  // Ensure the page is interactive when modal is open
  useEffect(() => {
    if (isAddUserOpen || isEditUserOpen || isDeleteConfirmOpen) {
      // Make sure the body is still interactive
      document.body.style.pointerEvents = "auto"

      // Remove any scroll locks that might have been applied
      document.documentElement.classList.remove("radix-dialog-scroll-lock")
      document.documentElement.style.removeProperty("padding-right")
    }
  }, [isAddUserOpen, isEditUserOpen, isDeleteConfirmOpen])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("users").select("*")

      if (error) {
        console.error("Error fetching users:", error.message)
        toast.error("Error fetching users", {
          description: error.message,
        })
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error.message)
      toast.error("Error fetching users", {
        description: "Failed to load users. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter users based on search term and status filter
  const filteredUsers = users.filter((user) => {
    const searchRegex = new RegExp(searchTerm, "i")
    const statusMatch = statusFilter === "all" || user.status === statusFilter

    return (
      (searchRegex.test(user.name) || searchRegex.test(user.email) || searchRegex.test(user.user_id || "")) &&
      statusMatch
    )
  })

  // Handle opening the edit user modal
  const handleEditUser = (user) => {
    setSelectedUser(user)
    setIsEditUserOpen(true)
  }

  // Handle opening the delete confirmation modal
  const handleDeleteConfirm = (user) => {
    setSelectedUser(user)
    setIsDeleteConfirmOpen(true)
  }

  // Handle form input changes for new user
  const handleNewUserChange = (e) => {
    const { name, value } = e.target
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  // Handle form input changes for editing user
  const handleEditUserChange = (e) => {
    const { name, value } = e.target
    setSelectedUser((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  // Validate form
  const validateForm = (data, isNewUser = false) => {
    const errors = {}

    if (!data.name || data.name.trim() === "") {
      errors.name = "Name is required"
    }
    if (!data.user_id || data.user_id.trim() === "") {
      errors.user_id = "User ID is required"
    }

    if (!data.email || data.email.trim() === "") {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid"
    }

    if (!data.phone || data.phone.trim() === "") {
      errors.phone = "Phone number is required"
    }

    if (isNewUser && (!data.password || data.password.trim() === "")) {
      errors.password = "Password is required"
    }

    return errors
  }

  // Handle adding a new user
  const handleAddUser = async () => {
    // Validate form
    const errors = validateForm(newUser, true)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      const { error } = await supabase.from("users").insert({
        ...newUser,
      })

      if (error) {
        throw error
      }

      // Refresh the user list
      fetchUsers()

      // Close the modal and reset form
      setIsAddUserOpen(false)
      setNewUser({
        name: "",
        email: "",
        user_id: "",
        phone: "",
        status: "active",
        password: "",
      })

      toast.success("User added successfully", {
        description: `${newUser.name} has been added to the system.`,
      })
    } catch (error) {
      console.error("Error adding user:", error.message)
      toast.error("Error adding user", {
        description: error.message,
      })
    }
  }

  // Handle updating a user
  const handleUpdateUser = async () => {
    // Validate form
    const errors = validateForm(selectedUser)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: selectedUser.name,
          email: selectedUser.email,
          phone: selectedUser.phone,
          status: selectedUser.status,
        })
        .eq("id", selectedUser.id)

      if (error) {
        throw error
      }

      // Refresh the user list
      fetchUsers()

      // Close the modal
      setIsEditUserOpen(false)

      toast.success("User updated successfully", {
        description: `${selectedUser.name}'s information has been updated.`,
      })
    } catch (error) {
      console.error("Error updating user:", error.message)
      toast.error("Error updating user", {
        description: error.message,
      })
    }
  }

  // Handle deleting a user
  const handleDeleteUser = async () => {
    try {
      const { error } = await supabase.from("users").delete().eq("id", selectedUser.id)

      if (error) {
        throw error
      }

      // Refresh the user list
      fetchUsers()

      // Close the modal
      setIsDeleteConfirmOpen(false)

      toast.success("User deleted successfully", {
        description: `${selectedUser.name} has been removed from the system.`,
      })
    } catch (error) {
      console.error("Error deleting user:", error.message)
      toast.error("Error deleting user", {
        description: error.message,
      })
    }
  }

  // Custom modal component
  const Modal = ({ isOpen, onClose, children, maxWidth = "500px" }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="fixed inset-0 bg-black/50" aria-hidden="true"></div>
        <div
          className={`relative bg-background p-6 rounded-lg shadow-lg w-full max-h-[90vh] overflow-y-auto`}
          style={{ maxWidth }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          <button className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          {children}
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <Button className="flex items-center gap-1" onClick={() => setIsAddUserOpen(true)}>
          <UserPlus className="h-4 w-4 mr-1" />
          Add User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Surveyor ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.user_id || "N/A"}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "N/A"}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell className="text-right">
                  
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : user.status === "inactive"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>{user.phone_number}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-red-600"
                          onClick={() => handleDeleteConfirm(user)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  No users found matching your search criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} maxWidth="500px">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Add New User</h2>
          <p className="text-sm text-muted-foreground">Create a new user account. All fields are required.</p>
        </div>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="flex items-center gap-1">
              <User className="h-4 w-4" /> Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter full name"
              value={newUser.name}
              onChange={handleNewUserChange}
              className={formErrors.name ? "border-red-500" : ""}
            />
            {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user_id" className="flex items-center gap-1">
              <User className="h-4 w-4" /> User Id
            </Label>
            <Input
              id="user_id"
              name="user_id"
              placeholder="Enter User id"
              value={newUser.user_id}
              onChange={handleNewUserChange}
              className={formErrors.user_id ? "border-red-500" : ""}
            />
            {formErrors.user_id && <p className="text-xs text-red-500">{formErrors.user_id}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="flex items-center gap-1">
              <Mail className="h-4 w-4" /> Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={newUser.email}
              onChange={handleNewUserChange}
              className={formErrors.email ? "border-red-500" : ""}
            />
            {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone" className="flex items-center gap-1">
              <Phone className="h-4 w-4" /> Phone Number
            </Label>
            <Input
              id="phone_number"
              name="phone"
              placeholder="Enter phone number"
              value={newUser.phone}
              onChange={handleNewUserChange}
              className={formErrors.phone ? "border-red-500" : ""}
            />
            {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="flex items-center gap-1">
              <Shield className="h-4 w-4" /> Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={newUser.password}
              onChange={handleNewUserChange}
              className={formErrors.password ? "border-red-500" : ""}
            />
            {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status" className="flex items-center gap-1">
              Status
            </Label>
            <Select
              name="status"
              value={newUser.status}
              onValueChange={(value) => setNewUser((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddUser}>Add User</Button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      {selectedUser && (
        <Modal isOpen={isEditUserOpen} onClose={() => setIsEditUserOpen(false)} maxWidth="500px">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Edit User</h2>
            <p className="text-sm text-muted-foreground">Update user information for {selectedUser.name}</p>
          </div>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="flex items-center gap-1">
                <User className="h-4 w-4" /> Name
              </Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Enter full name"
                value={selectedUser.name}
                onChange={handleEditUserChange}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-email" className="flex items-center gap-1">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={selectedUser.email}
                onChange={handleEditUserChange}
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-phone" className="flex items-center gap-1">
                <Phone className="h-4 w-4" /> Phone Number
              </Label>
              <Input
                id="edit-phone"
                name="phone_number"
                placeholder="Enter phone number"
                value={selectedUser.phone_number}
                onChange={handleEditUserChange}
                className={formErrors.phone_number ? "border-red-500" : ""}
              />
              {formErrors.phone_number && <p className="text-xs text-red-500">{formErrors.phone_number}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-status" className="flex items-center gap-1">
                Status
              </Label>
              <Select
                name="status"
                value={selectedUser.status}
                onValueChange={(value) => setSelectedUser((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {selectedUser && (
        <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} maxWidth="425px">
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
              <Trash className="h-5 w-5" />
              Confirm Deletion
            </h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md my-4">
            <p className="font-medium">{selectedUser.name}</p>
            <p className="text-sm text-gray-500">{selectedUser.email}</p>
            <p className="text-sm text-gray-500">ID: {selectedUser.user_id || "N/A"}</p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </div>
        </Modal>
      )}
    </div>
    </AdminLayout>
  )
}

