"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreVertical, Eye, Edit, UserX, Mail, Phone, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { EditStaffForm } from "./edit-staff-form"
import { StaffProfile } from "@/components/staff/staff-profile"
import type { Staff } from "@/types/staff"
import { useToast } from "@/hooks/use-toast"
import { useStaffData } from "@/hooks/use-staff"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { memo } from "react"

interface StaffDirectoryProps {
  searchQuery: string;
  departmentFilter: string;
  roleFilter: string;
  statusFilter: string;
}

export function StaffDirectory({ 
  searchQuery,
  departmentFilter,
  roleFilter,
  statusFilter,
}: StaffDirectoryProps) {
  
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const { toast } = useToast()
  
  // Use the hook within the component to encapsulate all staff data and pagination functionality
  const { 
    filteredStaff: staff, 
    stats, 
    departments, 
    roles, 
    isLoading, 
    handleRefresh,
    handleNewStaffSubmit,
    handleStaffUpdate,
    pagination,
    changePage,
    changePageSize,
    filterStaff
  } = useStaffData({
    searchQuery,
    departmentFilter,
    roleFilter,
    statusFilter,
  })

  const handleViewStaff = (staff: Staff) => {
    setSelectedStaff(staff)
    setIsViewModalOpen(true)
  }

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff)
    setIsEditModalOpen(true)
  }

  const handleDeactivateStaff = (staff: Staff) => {
    setSelectedStaff(staff)
    setIsDeactivateDialogOpen(true)
  }

  const confirmDeactivateStaff = () => {
    if (!selectedStaff) return

    const updatedStaff = {
      ...selectedStaff,
      status: selectedStaff.status === "active" ? "inactive" : "active",
    }

    handleStaffUpdate(updatedStaff)

    toast({
      title: `Staff ${updatedStaff.status === "active" ? "Activated" : "Deactivated"}`,
      description: `${selectedStaff.firstName} ${selectedStaff.lastName} has been ${updatedStaff.status === "active" ? "activated" : "deactivated"}.`,
      variant: updatedStaff.status === "active" ? "default" : "destructive",
    })

    setIsDeactivateDialogOpen(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Inactive
          </Badge>
        )
      case "on-leave":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            On Leave
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <AlertCircle className="h-8 w-8 mb-2 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff && staff.length > 0 ? (
              staff.map((staffMember: Staff) => (
                <TableRow key={staffMember.id}>
                  <TableCell className="font-medium">
                    {staffMember.firstName} {staffMember.lastName}
                  </TableCell>
                  <TableCell>{staffMember.role}</TableCell>
                  <TableCell>{staffMember.department}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{staffMember.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        <span>{staffMember.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="text-[0.65em] font-medium">{staffMember.joiningDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(staffMember.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewStaff(staffMember)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditStaff(staffMember)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Staff
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeactivateStaff(staffMember)}
                          className={staffMember.status === "active" ? "text-red-600" : "text-green-600"}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          {staffMember.status === "active" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>No staff members found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {staff && staff.length > 0 ? pagination.currentPage * pagination.pageSize + 1 : 0} to{" "}
            {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalCount)} of{" "}
            {pagination.totalCount} staff members
          </div>
          <div className="flex items-center space-x-2">
            <Select 
              value={pagination.pageSize.toString()} 
              onValueChange={(value) => changePageSize(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => changePage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <div className="text-sm">
                Page {pagination.currentPage + 1} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => changePage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Staff Profile */}
      {selectedStaff && (
        <StaffProfile staff={selectedStaff} isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
      )}

      {/* Edit Staff Form */}
      {selectedStaff && (
        <EditStaffForm
          staff={selectedStaff}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleStaffUpdate}
        />
      )}

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedStaff?.status === "active" ? "Deactivate Staff" : "Activate Staff"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStaff?.status === "active"
                ? `This will deactivate ${selectedStaff?.firstName} ${selectedStaff?.lastName}'s account. They will no longer be able to access the system.`
                : `This will activate ${selectedStaff?.firstName} ${selectedStaff?.lastName}'s account. They will be able to access the system again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeactivateStaff}
              className={
                selectedStaff?.status === "active"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-green-600 text-white hover:bg-green-700"
              }
            >
              {selectedStaff?.status === "active" ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Export a memoized version of the component to prevent unnecessary re-renders
export const MemoizedStaffDirectory = memo(StaffDirectory);
