"use client";

import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  Phone,
  MapPin,
  MoreVertical,
  RefreshCw,
  Edit,
  Trash2,
  Mail,
  ChevronLeft,
  ChevronRight,
  Upload,
  Plus,
  Download,
  FileText,
  Users,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

interface Parent {
  id: string;
  name: string;
  parentId: string;
  email: string;
  phone: string;
  photoUrl: string;
  relationship: "Father" | "Mother" | "Guardian";
  occupation: string;
  address: string;
  children: string[];
  status: "Active" | "Inactive";
  emergencyContact: boolean;
}

const parents: Parent[] = [
  {
    id: "1",
    name: "Robert Johnson",
    parentId: "PAR001",
    email: "robert.johnson@email.com",
    phone: "(555) 123-4567",
    photoUrl: "https://i.pravatar.cc/150?img=12",
    relationship: "Father",
    occupation: "Software Engineer",
    address: "123 Main Street, San Francisco, CA 94103",
    children: ["John Doe", "Jane Doe"],
    status: "Active",
    emergencyContact: true,
  },
  {
    id: "2",
    name: "Mary Johnson",
    parentId: "PAR002",
    email: "mary.johnson@email.com",
    phone: "(555) 123-4568",
    photoUrl: "https://i.pravatar.cc/150?img=5",
    relationship: "Mother",
    occupation: "Teacher",
    address: "123 Main Street, San Francisco, CA 94103",
    children: ["John Doe", "Jane Doe"],
    status: "Active",
    emergencyContact: true,
  },
  {
    id: "3",
    name: "Michael Von",
    parentId: "PAR003",
    email: "michael.von@email.com",
    phone: "(555) 234-5678",
    photoUrl: "https://i.pravatar.cc/150?img=13",
    relationship: "Father",
    occupation: "Business Owner",
    address: "5678 Oak Avenue, San Francisco, CA 94105",
    children: ["Julie Von"],
    status: "Active",
    emergencyContact: true,
  },
  {
    id: "4",
    name: "Emma Von",
    parentId: "PAR004",
    email: "emma.von@email.com",
    phone: "(555) 234-5679",
    photoUrl: "https://i.pravatar.cc/150?img=9",
    relationship: "Mother",
    occupation: "Nurse",
    address: "5678 Oak Avenue, San Francisco, CA 94105",
    children: ["Julie Von"],
    status: "Active",
    emergencyContact: false,
  },
  {
    id: "5",
    name: "David Walker",
    parentId: "PAR005",
    email: "david.walker@email.com",
    phone: "(555) 345-6789",
    photoUrl: "https://i.pravatar.cc/150?img=15",
    relationship: "Father",
    occupation: "Architect",
    address: "9012 Pine Street, San Francisco, CA 94107",
    children: ["Jocelyn Walker"],
    status: "Active",
    emergencyContact: true,
  },
  {
    id: "6",
    name: "Lisa Walker",
    parentId: "PAR006",
    email: "lisa.walker@email.com",
    phone: "(555) 345-6790",
    photoUrl: "https://i.pravatar.cc/150?img=20",
    relationship: "Mother",
    occupation: "Doctor",
    address: "9012 Pine Street, San Francisco, CA 94107",
    children: ["Jocelyn Walker"],
    status: "Active",
    emergencyContact: true,
  },
  {
    id: "7",
    name: "Thomas Brown",
    parentId: "PAR007",
    email: "thomas.brown@email.com",
    phone: "(555) 456-7890",
    photoUrl: "https://i.pravatar.cc/150?img=33",
    relationship: "Guardian",
    occupation: "Retired",
    address: "3456 Elm Street, San Francisco, CA 94109",
    children: ["Michael Brown"],
    status: "Active",
    emergencyContact: true,
  },
  {
    id: "8",
    name: "Patricia Martinez",
    parentId: "PAR008",
    email: "patricia.martinez@email.com",
    phone: "(555) 567-8901",
    photoUrl: "https://i.pravatar.cc/150?img=25",
    relationship: "Mother",
    occupation: "Lawyer",
    address: "654 Cedar Lane, San Francisco, CA 94111",
    children: ["David Martinez", "Sofia Martinez"],
    status: "Active",
    emergencyContact: true,
  },
];

const ITEMS_PER_PAGE = 10;

export default function ParentsManagementDashboard() {
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openSection, setOpenSection] = useState<string | null>("personal");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Parent data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh parent data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredParents = parents.filter((parent) => {
    const matchesSearch =
      parent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.parentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.children.some((child) =>
        child.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesRelationship =
      relationshipFilter === "all" ||
      parent.relationship === relationshipFilter;
    const matchesStatus =
      statusFilter === "all" || parent.status === statusFilter;

    return matchesSearch && matchesRelationship && matchesStatus;
  });

  const totalPages = Math.ceil(filteredParents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedParents = filteredParents.slice(startIndex, endIndex);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 border-green-200";
      case "Inactive":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleRowClick = (parent: Parent) => {
    setSelectedParent(parent);
    setDetailsSheetOpen(true);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Importing file:", file.name);
      setImportDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent =
      "Name,Email,Phone,Relationship,Occupation,Status\nJohn Doe,john.doe@email.com,+1234567890,Father,Engineer,Active";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "parents_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">Parents Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage parent and guardian information
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => setImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Parents</DialogTitle>
                <DialogDescription>
                  Upload a CSV to bulk import parents/guardians
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileImport}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">Supports CSV</p>
                </div>
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="flex-1 sm:flex-none" asChild>
            <Link href="/admin/parents/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Parent
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card className="flex flex-col h-[calc(100vh-16rem)]">
        <CardHeader>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search parents..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={relationshipFilter}
              onValueChange={(val) => {
                setRelationshipFilter(val);
                setCurrentPage(1);
              }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Relations</SelectItem>
                <SelectItem value="Father">Father</SelectItem>
                <SelectItem value="Mother">Mother</SelectItem>
                <SelectItem value="Guardian">Guardian</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
            <span className="font-medium">
              Parent List ({filteredParents.length})
            </span>
            <span>
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredParents.length)} of{" "}
              {filteredParents.length}
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            {filteredParents.length > 0 ? (
              <table className="w-full">
                <thead className="sticky top-0 z-20 bg-background border-b">
                  <tr>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Parent/Guardian</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Relationship</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Children</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Contact Information</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background w-[50px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedParents.map((parent) => (
                    <tr
                      key={parent.id}
                      onClick={() => handleRowClick(parent)}
                      className="border-b transition-colors hover:bg-muted/50 cursor-pointer">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={parent.photoUrl}
                              alt={parent.name}
                            />
                            <AvatarFallback>
                              {parent.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{parent.name}</p>
                            <p className="text-xs text-gray-500">
                              {parent.parentId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant="outline">{parent.relationship}</Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm">
                          {parent.children.map((child, idx) => (
                            <p key={idx} className="text-gray-700">
                              {child}
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm">
                          <div className="flex items-center gap-1.5 text-gray-700 mb-1">
                            <Mail className="h-3 w-3" />
                            <span className="text-xs">{parent.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <Phone className="h-3 w-3" />
                            <span className="text-xs">{parent.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                            parent.status
                          )}`}>
                          {parent.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedParent(parent);
                                setEditDialogOpen(true);
                              }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedParent(parent);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Users className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>No parents found</EmptyTitle>
                  <EmptyDescription>
                    {searchQuery || relationshipFilter !== "all" || statusFilter !== "all"
                      ? "No parents match your current filters. Try adjusting your search criteria."
                      : "Get started by adding your first parent or guardian to the system."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-9">
                      {page}
                    </Button>
                  )
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basic Details Sheet */}
      <Sheet open={detailsSheetOpen} onOpenChange={setDetailsSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 overflow-hidden flex flex-col">
          {selectedParent && (
            <>
              <SheetHeader className="p-6 pb-4 border-b pt-16 shrink-0">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedParent.photoUrl}
                      alt={selectedParent.name}
                    />
                    <AvatarFallback className="text-lg">
                      {selectedParent.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <SheetTitle className="mb-1">
                        {selectedParent.name}
                      </SheetTitle>
                      <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md whitespace-nowrap">
                        {selectedParent.relationship}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedParent.parentId}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.location.href = `tel:${selectedParent.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.location.href = `mailto:${selectedParent.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-4">
                  {/* Personal Info - Collapsible */}
                  <Collapsible
                    open={openSection === "personal"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "personal" : null)
                    }
                    className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Personal Information
                      </h3>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2">
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Relationship
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedParent.relationship}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Occupation
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedParent.occupation}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground">
                              Emergency Contact
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedParent.emergencyContact ? "Yes" : "No"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Contact Info - Collapsible */}
                  <Collapsible
                    open={openSection === "contact"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "contact" : null)
                    }
                    className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Contact Information
                      </h3>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2">
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground">
                              Email
                            </label>
                            <p className="text-sm font-medium mt-0.5 break-all">
                              {selectedParent.email}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Phone
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedParent.phone}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground">
                              Address
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedParent.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Children - Collapsible */}
                  <Collapsible
                    open={openSection === "children"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "children" : null)
                    }
                    className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Children
                      </h3>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div className="px-4 pb-4">
                        <div className="pt-2 space-y-2">
                          {selectedParent.children.map((child, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 rounded-lg border">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {child}
                              </span>
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground mt-3">
                            Total: {selectedParent.children.length} {selectedParent.children.length === 1 ? "child" : "children"}
                          </p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Parent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedParent?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedParent(null);
              }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Parent</DialogTitle>
            <DialogDescription>
              Update parent/guardian information for {selectedParent?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input defaultValue={selectedParent?.name} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent ID</label>
                <Input defaultValue={selectedParent?.parentId} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue={selectedParent?.email} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input defaultValue={selectedParent?.phone} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Relationship</label>
                <Select defaultValue={selectedParent?.relationship}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Father">Father</SelectItem>
                    <SelectItem value="Mother">Mother</SelectItem>
                    <SelectItem value="Guardian">Guardian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Occupation</label>
                <Input defaultValue={selectedParent?.occupation} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select defaultValue={selectedParent?.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setEditDialogOpen(false);
              }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
