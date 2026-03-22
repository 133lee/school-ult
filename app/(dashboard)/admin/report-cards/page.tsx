"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  RefreshCw,
  FileText,
  Loader2,
  AlertTriangle,
  Plus,
  Download,
} from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { ReportCardsTable } from "@/components/shared/tables/report-cards-table";
import { EditReportCardDialog } from "@/components/report-cards/edit-report-card-dialog";
import { BulkGenerateDialog } from "@/components/report-cards/bulk-generate-dialog";
import { BulkDownloadDialog } from "@/components/report-cards/bulk-download-dialog";
import { ReportCardSheet } from "@/components/report-cards/report-card-sheet";
import { useReportCards } from "@/hooks/useReportCards";
import { useClasses } from "@/hooks/useClasses";
import { useTerms } from "@/hooks/useTerms";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useGrades } from "@/hooks/useGrades";
import { PromotionStatus } from "@/types/prisma-enums";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

export default function AdminReportCardsPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [termFilter, setTermFilter] = useState<string>("all");
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("all");
  const [promotionStatusFilter, setPromotionStatusFilter] = useState<
    PromotionStatus | "all"
  >("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedReportCardId, setSelectedReportCardId] = useState<
    string | null
  >(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetReportCardId, setSheetReportCardId] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportCardToDelete, setReportCardToDelete] = useState<any>(null);
  const [bulkGenerateDialogOpen, setBulkGenerateDialogOpen] = useState(false);
  const [bulkDownloadDialogOpen, setBulkDownloadDialogOpen] = useState(false);

  // Load filter options
  const { grades, isLoading: gradesLoading } = useGrades();
  const { classes: allClasses, isLoading: classesLoading } = useClasses({ mode: "all" }, { page: 1, pageSize: 10 });
  const { terms, isLoading: termsLoading } = useTerms();
  const { academicYears, isLoading: academicYearsLoading } = useAcademicYears();

  // Filter classes based on selected grade
  const filteredClasses = useMemo(() => {
    if (gradeFilter === "all") return allClasses;
    return allClasses.filter((classItem) => classItem.gradeId === gradeFilter);
  }, [gradeFilter, allClasses]);

  // Reset class filter when grade filter changes
  const handleGradeChange = (value: string) => {
    setGradeFilter(value);
    setClassFilter("all"); // Reset class filter when grade changes
  };

  // Use the report cards hook with filters and pagination
  const { reportCards, meta, isLoading, error, refetch, deleteReportCard } =
    useReportCards(
      {
        classId: classFilter !== "all" ? classFilter : undefined,
        termId: termFilter !== "all" ? termFilter : undefined,
        academicYearId:
          academicYearFilter !== "all" ? academicYearFilter : undefined,
        promotionStatus:
          promotionStatusFilter !== "all" ? promotionStatusFilter : undefined,
      },
      { page, pageSize }
    );

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Report cards list has been refreshed",
    });
  };

  const handleDeleteClick = (reportCard: any) => {
    setReportCardToDelete(reportCard);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reportCardToDelete) return;

    try {
      await deleteReportCard(reportCardToDelete.id);
      toast({
        title: "Success",
        description: "Report card deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete report card",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setReportCardToDelete(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setPage(newPage);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const totalPages = meta.totalPages;
    const currentPage = meta.page;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "ellipsis", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "ellipsis",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "ellipsis",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "ellipsis",
          totalPages
        );
      }
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">Report Cards Management</h1>
          <p className="text-muted-foreground text-sm">
            View, generate, and manage student report cards
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => setBulkDownloadDialogOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Bulk Download
          </Button>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => setBulkGenerateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Bulk Generate
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card className="flex flex-col h-[calc(100vh-12rem)]">
        <CardHeader>
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search report cards..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={gradeFilter}
              onValueChange={handleGradeChange}
              disabled={gradesLoading}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={classFilter}
              onValueChange={(value) => setClassFilter(value)}
              disabled={classesLoading || gradeFilter === "all"}>
              <SelectTrigger className="w-[140px]">
                <SelectValue
                  placeholder={
                    gradeFilter === "all"
                      ? "Select grade first"
                      : "Select Class"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {filteredClasses.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name} ({classItem.grade?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={termFilter}
              onValueChange={(value) => setTermFilter(value)}
              disabled={termsLoading}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.termType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={academicYearFilter}
              onValueChange={(value) => setAcademicYearFilter(value)}
              disabled={academicYearsLoading}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={promotionStatusFilter}
              onValueChange={(value) =>
                setPromotionStatusFilter(value as PromotionStatus | "all")
              }>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Promotion Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Promotion Status</SelectItem>
                <SelectItem value={PromotionStatus.PENDING}>
                  Pending Decision
                </SelectItem>
                <SelectItem value={PromotionStatus.PROMOTED}>
                  Promoted
                </SelectItem>
                <SelectItem value={PromotionStatus.RETAINED}>
                  Retained
                </SelectItem>
                <SelectItem value={PromotionStatus.CONDITIONAL}>
                  Conditional Promotion
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto">
          {error && (
            <div className="p-4 mb-4 bg-destructive/10 text-destructive rounded-md">
              <p className="font-medium">Error loading report cards</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Loading report cards...
                </p>
              </div>
            </div>
          ) : reportCards.length === 0 ? (
            <Empty className="h-96">
              <EmptyContent>
                <EmptyMedia variant="icon">
                  <FileText className="h-6 w-6" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No report cards found</EmptyTitle>
                  <EmptyDescription>
                    {gradeFilter !== "all" ||
                    classFilter !== "all" ||
                    termFilter !== "all" ||
                    academicYearFilter !== "all" ||
                    promotionStatusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Start by generating report cards for students"}
                  </EmptyDescription>
                </EmptyHeader>
              </EmptyContent>
            </Empty>
          ) : (
            <ReportCardsTable
              reportCards={reportCards}
              onRowClick={(reportCard) => {
                setSheetReportCardId(reportCard.id);
                setSheetOpen(true);
              }}
              onEdit={(reportCard) => {
                setSelectedReportCardId(reportCard.id);
                setEditDialogOpen(true);
              }}
              onDelete={handleDeleteClick}
              onPreview={(reportCard) => {
                setSheetReportCardId(reportCard.id);
                setSheetOpen(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && reportCards.length > 0 && (
        <div className="flex items-center justify-between">
          <Pagination className="flex items-center justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(page - 1)}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getPageNumbers().map((pageNum, index) =>
                pageNum === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum as number)}
                      isActive={pageNum === page}
                      className="cursor-pointer">
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(page + 1)}
                  className={
                    page === meta.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Edit Report Card Dialog */}
      <EditReportCardDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setSelectedReportCardId(null);
          }
        }}
        reportCardId={selectedReportCardId || undefined}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Bulk Generate Dialog */}
      <BulkGenerateDialog
        open={bulkGenerateDialogOpen}
        onOpenChange={(open) => {
          setBulkGenerateDialogOpen(open);
        }}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Bulk Download Dialog */}
      <BulkDownloadDialog
        open={bulkDownloadDialogOpen}
        onOpenChange={(open) => {
          setBulkDownloadDialogOpen(open);
        }}
      />

      {/* Report Card Details Sheet */}
      <ReportCardSheet
        reportCardId={sheetReportCardId}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            setSheetReportCardId(null);
          }
        }}
      />

      {/* Delete Report Card Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Delete Report Card</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left pt-3">
              Are you sure you want to delete this report card? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
